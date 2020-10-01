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

let idToken;
admin.initializeApp();

describe('System Tests', () => {
  const {ID_TOKEN} = process.env;
  if (!ID_TOKEN) {
    throw Error('"ID_TOKEN" environment variable is required.');
  }

  const {BASE_URL} = process.env;
  if (!BASE_URL) {
    throw Error(
      '"BASE_URL" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
    );
  }


  it('Can successfully make a request', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      headers: {
        Authorization: `Bearer ${ID_TOKEN.trim()}`
      },
      retry: 3
    };
    const response = await got('', options);
    assert.strictEqual(response.statusCode, 200);
  });

  // These tests won't work when deploying test services that require IAM authentication
  // it('Can successfully make a POST request', async () => {
  //   const options = {
  //     prefixUrl: BASE_URL.trim(),
  //     method: 'POST',
  //     form: {team: 'DOGS'},
  //     headers: {
  //       Authorization: `Bearer ${idToken}`
  //     },
  //     retry: 3
  //   };
  //   const response = await got('', options);
  //   assert.strictEqual(response.statusCode, 200);
  // });

  // it('Fails making POST request with bad param', async () => {
  //   const options = {
  //     prefixUrl: BASE_URL.trim(),
  //     method: 'POST',
  //     form: {team: 'PIGS'},
  //     headers: {
  //       Authorization: `Bearer ${ID_TOKEN}`
  //     },
  //     retry: 3
  //   };
  //   let err;
  //   try {
  //     const response = await got('', options);
  //   } catch(e) {
  //     err = e;
  //   }
  //   assert.strictEqual(err.response.statusCode, 400);
  // });

  // it('Fails making POST request without JWT token', async () => {
  //   const options = {
  //     prefixUrl: BASE_URL.trim(),
  //     method: 'POST',
  //     form: {team: 'DOGS'},
  //     retry: 3
  //   };
  //   let err;
  //   try {
  //     const response = await got('', options);
  //   } catch(e) {
  //     err = e;
  //   }
  //   assert.strictEqual(err.response.statusCode, 401);
  // });
  //
  // it('Fails making POST request with bad JWT token', async () => {
  //   const options = {
  //     prefixUrl: BASE_URL.trim(),
  //     method: 'POST',
  //     form: {team: 'DOGS'},
  //     headers: {
  //       Authorization: `Bearer ${ID_TOKEN.trim()}`
  //     },
  //     retry: 3
  //   };
  //   let err;
  //   try {
  //     const response = await got('', options);
  //   } catch(e) {
  //     err = e;
  //   }
  //   assert.strictEqual(err.response.statusCode, 403);
  // });
});
