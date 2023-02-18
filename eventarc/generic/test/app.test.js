// Copyright 2019 Google LLC
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

import assert from 'assert';
import path from 'path';
import supertest from 'supertest';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let request;

describe('Unit Tests', () => {
  before(() => {
    const app = createRequire(path.join(__dirname, '..', 'app'));
    request = supertest(app);
  });

  describe('should succeed', () => {
    it('should relay the CloudEvent', async () => {
      await request
        .post('/')
        .type('json')
        .set('ce-id', 1234)
        .set('Authorization', 'MY-SECRET-VALUE') // never logged
        .send({testkey: 'testvalue'})
        .expect(res => {
          const responseBody = res.body;

          assert.strictEqual(
            responseBody.headers.host.startsWith('127.0.0.1'),
            true
          );
          assert.strictEqual(+responseBody.headers['ce-id'], 1234);
          assert.strictEqual(responseBody.headers['Authorization'], undefined);
          assert.deepStrictEqual(responseBody.body, {testkey: 'testvalue'});
        });
    });
  });
});
