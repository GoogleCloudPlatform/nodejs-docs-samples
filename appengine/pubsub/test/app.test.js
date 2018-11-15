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

const test = require(`ava`);
const path = require(`path`);
const utils = require(`@google-cloud/nodejs-repo-tools`);

const message = `This is a test message sent at: `;
const payload = message + Date.now();

const cwd = path.join(__dirname, `../`);
const requestObj = utils.getRequest({cwd: cwd});

test.serial.cb(`should send a message to Pub/Sub`, t => {
  requestObj
    .post(`/`)
    .type('form')
    .send({payload: payload})
    .expect(200)
    .expect(response => {
      t.is(response.text, `Message sent`);
    })
    .end(t.end);
});

test.serial.cb(`should receive incoming Pub/Sub messages`, t => {
  requestObj
    .post(`/pubsub/push`)
    .query({token: process.env.PUBSUB_VERIFICATION_TOKEN})
    .send({
      message: {
        data: payload,
      },
    })
    .expect(200)
    .end(t.end);
});

test.serial.cb(
  `should check for verification token on incoming Pub/Sub messages`,
  t => {
    requestObj
      .post(`/pubsub/push`)
      .field(`payload`, payload)
      .expect(400)
      .end(t.end);
  }
);

test.serial.cb(`should list sent Pub/Sub messages`, t => {
  requestObj
    .get(`/`)
    .expect(200)
    .expect(response => {
      t.regex(response.text, /Messages received by this instance/);
    })
    .end(t.end);
});
