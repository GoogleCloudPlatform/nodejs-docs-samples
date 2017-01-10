/**
 * Copyright 2016, Google, Inc.
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

require(`../../../test/_setup`);

const express = require(`express`);
const winston = require(`winston`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();
const request = require(`supertest`);

const SAMPLE_PATH = path.join(__dirname, `../app.js`);

function getSample () {
  const testApp = express();
  sinon.stub(testApp, `listen`).callsArg(1);
  const expressMock = sinon.stub().returns(testApp);
  const resultsMock = JSON.stringify({
    timestamp: `1234`,
    userIp: `abcd`
  }) + `\n`;
  const winstonMock = {
    add: sinon.stub(),
    error: sinon.stub()
  };

  const app = proxyquire(SAMPLE_PATH, {
    winston: winstonMock,
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      winston: winstonMock
    }
  };
}

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test(`sets up the sample`, (t) => {
  const sample = getSample();

  t.true(sample.mocks.express.calledOnce);
  t.true(sample.mocks.winston.add.calledOnce);
  t.true(sample.mocks.winston.add.firstCall.args[0] === winston.transports.File);
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
      t.true(sample.mocks.winston.error.calledOnce);
      t.is(response.text, expectedResult);
    })
    .end(t.end);
});
