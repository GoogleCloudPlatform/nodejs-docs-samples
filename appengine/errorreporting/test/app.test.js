/**
 * Copyright 2017, Google, Inc.
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
const proxyquire = require(`proxyquire`).noPreserveCache();
const request = require(`supertest`);
const sinon = require('sinon');
const test = require('ava');
const tools = require('@google-cloud/nodejs-repo-tools');

const SAMPLE_PATH = path.join(__dirname, `../app.js`);

function getSample () {
  const testApp = express();
  sinon.stub(testApp, `listen`).callsArg(1);
  const expressMock = sinon.stub().returns(testApp);
  const resultsMock = JSON.stringify({
    timestamp: `1234`,
    userIp: `abcd`
  }) + `\n`;
  const reportMock = sinon.stub();
  const errorsMock = sinon.stub().callsFake(function ErrorReporting () {
    return {
      report: reportMock
    };
  });

  const app = proxyquire(SAMPLE_PATH, {
    express: expressMock,
    '@google-cloud/error-reporting': errorsMock
  });
  return {
    app: app,
    mocks: {
      errors: errorsMock,
      express: expressMock,
      report: reportMock,
      results: resultsMock
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`sets up the sample`, (t) => {
  const sample = getSample();

  t.true(sample.mocks.express.calledOnce);
  t.true(sample.mocks.errors.calledOnce);
  t.is(sample.mocks.report.callCount, 0);
  t.true(sample.app.listen.calledOnce);
  t.is(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
});

test.cb(`should throw an error`, (t) => {
  const sample = getSample();
  const expectedResult = `something is wrong!`;

  request(sample.app)
    .get(`/`)
    .expect(500)
    .expect((response) => {
      t.true(sample.mocks.report.calledOnce);
      t.is(response.text, expectedResult);
    })
    .end(t.end);
});
