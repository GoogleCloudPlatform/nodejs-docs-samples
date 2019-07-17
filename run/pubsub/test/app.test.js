// Copyright 2019, Google LLC.
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
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const cwd = path.join(__dirname, '../');
const requestObj = tools.getRequest({cwd});

describe('Unit Tests', () => {
  describe('should fail', () => {
    it(`on a Bad Request with an empty payload`, async () => {
      await requestObj
        .post('/')
        .type('json')
        .send('')
        .expect(400);
    });

    it(`on a Bad Request with an invalid payload`, async () => {
      await requestObj
        .post('/')
        .type('json')
        .send({nomessage: 'invalid'})
        .expect(400);
    });

    it(`on a Bad Request with an invalid mimetype`, async () => {
      await requestObj
        .post('/')
        .type('text')
        .send('{message: true}')
        .expect(400);
    });
  });

  describe('should succeed', () => {
    beforeEach(tools.stubConsole);
    afterEach(tools.restoreConsole);

    it(`with a minimally valid Pub/Sub Message`, async () => {
      await requestObj
        .post('/')
        .type('json')
        .send({message: true})
        .expect(204)
        .expect(() => assert.ok(console.log.calledWith('Hello World!')));
    });

    it(`with a populated Pub/Sub Message`, async () => {
      const name = uuid.v4();
      const data = Buffer.from(name).toString(`base64`);

      await requestObj
        .post('/')
        .type('json')
        .send({message: {data}})
        .expect(204)
        .expect(() => assert.ok(console.log.calledWith(`Hello ${name}!`)));
    });
  });
});
