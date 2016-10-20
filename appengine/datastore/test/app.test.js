// Copyright 2016, Google, Inc.
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

'use strict';

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
    assert.equal(port, 8080);
    setTimeout(() => {
      callback();
    });
    return serverMock;
  });
  const expressMock = sinon.stub().returns(testApp);
  const resultsMock = [
    {
      data: {
        timestamp: `1234`,
        userIp: `abcd`
      }
    }
  ];
  const queryMock = {
    order: sinon.stub(),
    limit: sinon.stub()
  };
  queryMock.order.returns(queryMock);
  queryMock.limit.returns(queryMock);

  const datasetMock = {
    save: sinon.stub().callsArg(1),
    createQuery: sinon.stub().returns(queryMock),
    runQuery: sinon.stub().callsArgWith(1, null, resultsMock),
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

describe(`appengine/datastore/app.js`, () => {
  let sample;

  beforeEach(() => {
    sample = getSample();

    assert(sample.mocks.express.calledOnce);
    assert(sample.mocks.Datastore.calledOnce);
    assert(sample.app.listen.calledOnce);
    assert.equal(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
  });

  it(`should record a visit`, (done) => {
    const expectedResult = `Last 10 visits:\nTime: 1234, AddrHash: abcd`;

    request(sample.app)
      .get(`/`)
      .expect(200)
      .expect((response) => {
        console.log(response.body);
        assert.equal(response.text, expectedResult);
      })
      .end(done);
  });

  it(`should handle insert error`, (done) => {
    const expectedResult = `insert_error`;

    sample.mocks.dataset.save.callsArgWith(1, expectedResult);

    request(sample.app)
      .get(`/`)
      .expect(500)
      .expect((response) => {
        assert.equal(response.text, expectedResult + `\n`);
      })
      .end(done);
  });

  it(`should handle read error`, (done) => {
    const expectedResult = `read_error`;

    sample.mocks.dataset.runQuery.callsArgWith(1, expectedResult);

    request(sample.app)
      .get(`/`)
      .expect(500)
      .expect((response) => {
        assert.equal(response.text, `${expectedResult}\n`);
      })
      .end(done);
  });
});
