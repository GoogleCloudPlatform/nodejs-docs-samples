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

const test = require(`ava`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();
const sinon = require(`sinon`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const SAMPLE_PATH = path.join(__dirname, `../createTables.js`);

const exampleConfig = [`user`, `password`, `database`];

function getSample() {
  const configMock = exampleConfig;
  const promptMock = {
    start: sinon.stub(),
    get: sinon.stub().yields(null, configMock),
  };
  const tableMock = {
    increments: sinon.stub(),
    timestamp: sinon.stub(),
    string: sinon.stub(),
  };
  const knexMock = {
    schema: {
      createTable: sinon.stub(),
    },
    destroy: sinon.stub().returns(Promise.resolve()),
  };

  knexMock.schema.createTable
    .returns(Promise.resolve(knexMock))
    .yields(tableMock);
  const KnexMock = sinon.stub().returns(knexMock);

  return {
    mocks: {
      Knex: KnexMock,
      knex: knexMock,
      config: configMock,
      prompt: promptMock,
    },
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.cb.serial(`should create a table`, t => {
  const sample = getSample();
  const expectedResult = `Successfully created 'visits' table.`;

  proxyquire(SAMPLE_PATH, {
    knex: sample.mocks.Knex,
    prompt: sample.mocks.prompt,
  });

  t.true(sample.mocks.prompt.start.calledOnce);
  t.true(sample.mocks.prompt.get.calledOnce);
  t.deepEqual(sample.mocks.prompt.get.firstCall.args[0], exampleConfig);

  setTimeout(() => {
    t.true(sample.mocks.Knex.calledOnce);
    t.deepEqual(sample.mocks.Knex.firstCall.args, [
      {
        client: 'pg',
        connection: exampleConfig,
      },
    ]);

    t.true(sample.mocks.knex.schema.createTable.calledOnce);
    t.is(sample.mocks.knex.schema.createTable.firstCall.args[0], 'visits');

    t.true(console.log.calledWith(expectedResult));
    t.true(sample.mocks.knex.destroy.calledOnce);
    t.end();
  }, 10);
});

test.cb.serial(`should handle prompt error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  sample.mocks.prompt.get = sinon.stub().yields(error);

  proxyquire(SAMPLE_PATH, {
    knex: sample.mocks.Knex,
    prompt: sample.mocks.prompt,
  });

  setTimeout(() => {
    t.true(console.error.calledOnce);
    t.true(console.error.calledWith(error));
    t.true(sample.mocks.Knex.notCalled);
    t.end();
  }, 10);
});

test.cb.serial(`should handle knex creation error`, t => {
  const error = new Error(`error`);
  const sample = getSample();
  sample.mocks.knex.schema.createTable = sinon
    .stub()
    .returns(Promise.reject(error));

  proxyquire(SAMPLE_PATH, {
    knex: sample.mocks.Knex,
    prompt: sample.mocks.prompt,
  });

  setTimeout(() => {
    t.true(console.error.calledOnce);
    t.true(console.error.calledWith(`Failed to create 'visits' table:`, error));
    t.true(sample.mocks.knex.destroy.calledOnce);
    t.end();
  }, 10);
});
