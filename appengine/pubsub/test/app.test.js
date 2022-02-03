// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// NOTE:
// This app can only be fully tested when deployed, because
// Pub/Sub requires a live endpoint URL to hit. Nevertheless,
// these tests mock it and partially test it locally.

'use strict';

const assert = require('assert');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const path = require('path');
const sinon = require('sinon');
const supertest = require('supertest');
const proxyquire = require('proxyquire').noPreserveCache();

const message = 'This is a test message sent at: ';
const payload = message + Date.now();

process.env.PUBSUB_VERIFICATION_TOKEN = '123456abcdef';
process.env.PUBSUB_TOPIC = 'integration-tests-instance';
const cwd = path.join(__dirname, '../');
const requestObj = supertest(proxyquire(path.join(cwd, 'app'), {process}));

const fixtures = path.join(__dirname, 'fixtures');
const privateKey = fs.readFileSync(path.join(fixtures, 'privatekey.pem'));
const publicCert = fs.readFileSync(path.join(fixtures, 'public_cert.pem'));

const sandbox = sinon.createSandbox();
const pubsubVerificationToken = '123456abcdef';

const createFakeToken = () => {
  const now = Date.now() / 1000;

  const payload = {
    aud: 'example.com',
    azp: '1234567890',
    email: 'pubsub@example.iam.gserviceaccount.com',
    email_verified: true,
    iat: now,
    exp: now + 3600,
    iss: 'https://accounts.google.com',
    sub: '1234567890',
  };

  const options = {
    algorithm: 'RS256',
    keyid: 'fake_id',
  };

  return jwt.sign(payload, privateKey, options);
};

afterEach(() => {
  sandbox.restore();
});

describe('gae_flex_pubsub_index', () => {
  it('should send a message to Pub/Sub', async () => {
    await requestObj
      .post('/')
      .type('form')
      .send({payload: payload})
      .expect(200)
      .expect(response => {
        assert(new RegExp(/Message \d* sent/).test(response.text));
      });
  });

  it('should list sent Pub/Sub messages', async () => {
    await requestObj
      .get('/')
      .expect(200)
      .expect(response => {
        assert(
          new RegExp(/Messages received by this instance/).test(response.text)
        );
      });
  });
});

describe('gae_flex_pubsub_push', () => {
  it('should receive incoming Pub/Sub messages', async () => {
    await requestObj
      .post('/pubsub/push')
      .query({token: pubsubVerificationToken})
      .send({
        message: {
          data: payload,
        },
      })
      .expect(200);
  });

  it('should check for verification token on incoming Pub/Sub messages', async () => {
    await requestObj.post('/pubsub/push').field('payload', payload).expect(400);
  });
});

describe('gae_flex_pubsub_auth_push', () => {
  it('should verify incoming Pub/Sub push requests', async () => {
    sandbox
      .stub(OAuth2Client.prototype, 'getFederatedSignonCertsAsync')
      .resolves({
        certs: {
          fake_id: publicCert,
        },
      });

    await requestObj
      .post('/pubsub/authenticated-push')
      .set('Authorization', `Bearer ${createFakeToken()}`)
      .query({token: pubsubVerificationToken})
      .send({
        message: {
          data: Buffer.from(payload).toString('base64'),
        },
      })
      .expect(200);

    // Make sure the message is visible on the home page
    await requestObj
      .get('/')
      .expect(200)
      .expect(response => {
        assert(response.text.includes(payload));
      });
  });
});
