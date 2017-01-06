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
const path = require(`path`);
const proxyquire = require(`proxyquire`).noCallThru();
const request = require(`supertest`);

const SAMPLE_PATH = path.join(__dirname, `../app.js`);

function getSample () {
  const serverMock = {
    address: sinon.stub().returns({
      port: 8080
    })
  };
  const testApp = express();
  sinon.stub(testApp, `listen`, (port, callback) => {
    setTimeout(() => {
      callback();
    });
    return serverMock;
  });
  const expressMock = sinon.stub().returns(testApp);
  const resultsMock = [
    {
      timestamp: `1234`,
      userIp: `abcd`
    }
  ];
  const queryMock = {
    order: sinon.stub(),
    limit: sinon.stub()
  };
  queryMock.order.returns(queryMock);
  queryMock.limit.returns(queryMock);

  const datasetMock = {
    save: sinon.stub().returns(Promise.resolve()),
    createQuery: sinon.stub().returns(queryMock),
    runQuery: sinon.stub().returns(Promise.resolve([resultsMock])),
    key: sinon.stub().returns({})
  };
  const DatastoreMock = sinon.stub().returns(datasetMock);

  const app = proxyquire(SAMPLE_PATH, {
    '@google-cloud/datastore': DatastoreMock,
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      server: serverMock,
      express: expressMock,
      results: resultsMock,
      dataset: datasetMock,
      Datastore: DatastoreMock
    }
  };
}

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test(`sets up sample`, (t) => {
  const sample = getSample();

  t.true(sample.mocks.express.calledOnce);
  t.true(sample.mocks.Datastore.calledOnce);
  t.true(sample.app.listen.calledOnce);
  t.is(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
});

test.cb(`should record a visit`, (t) => {
  const sample = getSample();
  const expectedResult = `Last 10 visits:\nTime: 1234, AddrHash: abcd`;

  request(sample.app)
    .get(`/`)
    .expect(200)
    .expect((response) => {
      t.is(response.text, expectedResult);
    })
    .end(t.end);
});
