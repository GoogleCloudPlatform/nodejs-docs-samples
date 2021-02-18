// Copyright 2020, Google LLC.
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
const path = require('path');
const supertest = require('supertest');
const sinon = require('sinon');

let request;

describe('Unit Tests', () => {
  before(() => {
    const app = require(path.join(__dirname, '..', 'app'));
    request = supertest(app);
  });

  describe('should fail', () => {
    it('on a Bad Request with an empty payload', async () => {
      await request.post('/').type('json').send('').expect(400);
    });
  });

  describe('should succeed', () => {
    beforeEach(() => {
      sinon.spy(console, 'error');
      sinon.spy(console, 'log');
    });
    afterEach(() => {
      console.error.restore();
      console.log.restore();
    });

    it('with a minimally valid Cloud Storage event', async () => {
      await request
        .post('/')
        .set('ce-subject', 'test-subject')
        .send()
        .expect(200)
        .expect(() => {
          assert.strictEqual(
            console.log.calledWith(
              'Detected change in Cloud Storage bucket: test-subject'
            ),
            true
          );
        });
    });
  });
});
