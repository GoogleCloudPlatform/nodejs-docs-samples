// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const admin = require('firebase-admin');
const assert = require('assert');
const path = require('path');
const supertest = require('supertest');
const got = require('got');

let request;
let idToken;

describe('Unit Tests', () => {
  before(async () => {
    const app = require(path.join(__dirname, '..', 'app'));
    request = supertest(app);
 
    let uid = 'some-uid';
    const customToken = await admin.auth().createCustomToken(uid);
    const key = process.env.FIREBASE_KEY;
    const response = await got(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${key}`, {
      method: 'POST',
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true
      }),
    });
    const tokens = JSON.parse(response.body);
    idToken = tokens.idToken;
  });

  it('should display the default page', async () => {
    await request
      .get('/')
      .expect(200)
      .expect((response) => {
        assert.ok(response.text.includes('CATS v DOGS'));
      });
  });

  it('should insert vote', async () => {
    await request
      .post('/')
      .send('team=CATS')
      .set('Authorization', `Bearer ${idToken}`)
      .expect(200)
      .expect((response) => {
        assert.ok(response.text.includes('Successfully voted for'));
      });
  });

  it('should handle insert error', async () => {
    const expectedResult = 'Invalid team specified';

    await request
      .post('/')
      .set('Authorization', `Bearer ${idToken}`)
      .expect(400)
      .expect((response) => {
        assert.ok(response.text.includes(expectedResult));
      });
  });

  it('should reject request without JWT token', async () => {
    await request
      .post('/')
      .expect(401);
  });

  it('should reject request with invalid JWT token', async () => {
    await request
      .post('/')
      .set('Authorization', 'Bearer iam-a-token')
      .expect(403);
  });

});