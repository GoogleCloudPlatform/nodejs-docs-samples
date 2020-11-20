// Copyright 2017 Google LLC
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

const express = require('express');
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');

const SAMPLE_PATH = path.join(__dirname, '../app.js');

const getSample = () => {
  const testApp = express();
  sinon.stub(testApp, 'listen').callsArg(1);
  const expressMock = sinon.stub().returns(testApp);

  const app = proxyquire(SAMPLE_PATH, {
    express: expressMock,
  });
  return {
    app: app,
    mocks: {
      express: expressMock,
    },
  };
};

const stubConsole = function () {
  sinon.stub(console, 'error');
};

//Restore console
const restoreConsole = function () {
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

it('should echo a message', async () => {
  await request(getSample().app)
    .post('/echo')
    .send({message: 'foo'})
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.body.message, 'foo');
    });
});

it('should try to parse encoded info', async () => {
  await request(getSample().app)
    .get('/auth/info/googlejwt')
    .expect(200)
    .expect(response => {
      assert.deepStrictEqual(response.body, {id: 'anonymous'});
    });
});

it('should successfully parse encoded info', async () => {
  await request(getSample().app)
    .get('/auth/info/googlejwt')
    .set(
      'X-Endpoint-API-UserInfo',
      Buffer.from(JSON.stringify({id: 'foo'})).toString('base64')
    )
    .expect(200)
    .expect(response => {
      assert.deepStrictEqual(response.body, {id: 'foo'});
    });
});
