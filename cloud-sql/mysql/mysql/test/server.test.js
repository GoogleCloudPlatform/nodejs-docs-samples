/**
 * Copyright 2019 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const express = require(`express`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noCallThru();
const request = require(`supertest`);
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const SAMPLE_PATH = path.join(__dirname, `../server.js`);

function getSample() {
  const testApp = express();
  sinon.stub(testApp, `listen`).yields();
  const expressMock = sinon.stub().returns(testApp);
  const timestamp = new Date();
  const resultsMock = [
    {
      candidate: 'TABS',
      time_cast: timestamp,
    },
  ];

  const processMock = {
    env: {
      DB_USER: 'user',
      DB_PASS: 'password',
      DB_NAME: 'database',
    },
  };

  const app = proxyquire(SAMPLE_PATH, {
    express: expressMock,
    process: processMock,
  });

  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      process: processMock,
    },
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.cb(`should display the default page`, t => {
  const sample = getSample();
  const expectedResult = `Tabs VS Spaces`;

  request(sample.app)
    .get(`/`)
    .expect(200)
    .expect(response => {
      t.is(response.text, expectedResult);
    })
    .end(t.end);
});
