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

const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();

const SAMPLE_PATH = path.join(__dirname, `../createTables.js`);

function getSample () {
  const connectionMock = {
    query: sinon.stub(),
    end: sinon.stub()
  };
  connectionMock.query.onFirstCall().yields(null, `created visits table!`);
  const mysqlMock = {
    createConnection: sinon.stub().returns(connectionMock)
  };
  const configMock = {
    user: `user`,
    password: `password`,
    database: `database`,
    socketPath: `socketPath`
  };
  const promptMock = {
    start: sinon.stub(),
    get: sinon.stub().yields(null, configMock)
  };

  proxyquire(SAMPLE_PATH, {
    mysql: mysqlMock,
    prompt: promptMock
  });
  return {
    mocks: {
      connection: connectionMock,
      mysql: mysqlMock,
      config: configMock,
      prompt: promptMock
    }
  };
}

describe(`appengine/cloudsql/createTables.js`, () => {
  it(`should record a visit`, (done) => {
    const sample = getSample();
    const expectedResult = `created visits table!`;

    assert(sample.mocks.prompt.start.calledOnce);
    assert(sample.mocks.prompt.get.calledOnce);
    assert.deepEqual(sample.mocks.prompt.get.firstCall.args[0], [
      `user`,
      `password`,
      `database`
    ]);

    setTimeout(() => {
      assert.deepEqual(sample.mocks.mysql.createConnection.firstCall.args[0], sample.mocks.config);
      assert(console.log.calledWith(expectedResult));
      done();
    }, 10);
  });

  it(`should handle prompt error`, (done) => {
    const expectedResult = `createTables_prompt_error`;
    const sample = getSample();

    proxyquire(SAMPLE_PATH, {
      mysql: sample.mocks.mysql,
      prompt: {
        start: sinon.stub(),
        get: sinon.stub().callsArgWith(1, expectedResult)
      }
    });

    setTimeout(() => {
      assert(console.error.calledWith(expectedResult));
      done();
    }, 10);
  });

  it(`should handle insert error`, (done) => {
    const expectedResult = `createTables_insert_error`;
    const sample = getSample();

    const connectionMock = {
      query: sinon.stub().callsArgWith(1, expectedResult)
    };

    proxyquire(SAMPLE_PATH, {
      mysql: {
        createConnection: sinon.stub().returns(connectionMock)
      },
      prompt: sample.mocks.prompt
    });

    setTimeout(() => {
      assert(console.error.calledWith(expectedResult));
      done();
    }, 10);
  });
});
