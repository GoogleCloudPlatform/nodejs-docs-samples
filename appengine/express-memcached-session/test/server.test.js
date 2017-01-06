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
const session = require(`express-session`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();
const request = require(`supertest`);

const SAMPLE_PATH = path.join(__dirname, `../server.js`);

function getSample () {
  const testApp = express();
  sinon.stub(testApp, `listen`).callsArg(1);
  const storeMock = session.MemoryStore;
  const expressMock = sinon.stub().returns(testApp);
  const memcachedMock = sinon.stub().returns(storeMock);
  const publicIpMock = {
    v4: sinon.stub().yields(null, `123.45.67.890`)
  };

  const app = proxyquire(SAMPLE_PATH, {
    publicIp: publicIpMock,
    'connect-memjs': memcachedMock,
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock,
      store: storeMock,
      'connect-memjs': memcachedMock,
      publicIp: publicIpMock
    }
  };
}

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test(`sets up the sample`, (t) => {
  const sample = getSample();

  t.true(sample.mocks.express.calledOnce);
  t.true(sample.app.listen.calledOnce);
  t.is(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
});

test.cb(`should respond with visit count`, (t) => {
  const sample = getSample();
  const expectedResult = `Viewed <strong>1</strong> times.`;

  request(sample.app)
    .get(`/`)
    .expect(200)
    .expect((response) => {
      t.true(response.text.includes(expectedResult));
    })
    .end(t.end);
});
