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
    database: `database`
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

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.cb.serial(`should record a visit`, (t) => {
  const sample = getSample();
  const expectedResult = `created visits table!`;

  t.true(sample.mocks.prompt.start.calledOnce);
  t.true(sample.mocks.prompt.get.calledOnce);
  t.deepEqual(sample.mocks.prompt.get.firstCall.args[0], [
    `user`,
    `password`,
    `database`
  ]);

  setTimeout(() => {
    const uri = `mysql://${sample.mocks.config.user}:${sample.mocks.config.password}@127.0.0.1:3306/${sample.mocks.config.database}`;
    t.deepEqual(sample.mocks.mysql.createConnection.firstCall.args, [uri]);
    t.true(console.log.calledWith(expectedResult));
    t.end();
  }, 10);
});

test.cb.serial(`should handle prompt error`, (t) => {
  const error = new Error(`error`);
  const sample = getSample();

  proxyquire(SAMPLE_PATH, {
    mysql: sample.mocks.mysql,
    prompt: {
      start: sinon.stub(),
      get: sinon.stub().yields(error)
    }
  });

  setTimeout(() => {
    t.true(console.error.calledWith(error));
    t.end();
  }, 10);
});

test.cb.serial(`should handle insert error`, (t) => {
  const error = new Error(`error`);
  const sample = getSample();

  const connectionMock = {
    query: sinon.stub().yields(error),
    end: sinon.stub()
  };

  proxyquire(SAMPLE_PATH, {
    mysql: {
      createConnection: sinon.stub().returns(connectionMock)
    },
    prompt: sample.mocks.prompt
  });

  setTimeout(() => {
    t.true(console.error.calledWith(error));
    t.end();
  }, 10);
});
