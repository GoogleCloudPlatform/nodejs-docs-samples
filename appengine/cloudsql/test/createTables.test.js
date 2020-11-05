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

const assert = require('assert');
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

const SAMPLE_PATH = path.join(__dirname, '../createTables.js');

const exampleConfig = ['user', 'password', 'database'];

const getSample = () => {
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
};

const stubConsole = function () {
  /* eslint-disable no-console */
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

describe('gae_flex_mysql_create_tables', () => {
  it('should create a table', async () => {
    const sample = getSample();
    const expectedResult = "Successfully created 'visits' table.";

    proxyquire(SAMPLE_PATH, {
      knex: sample.mocks.Knex,
      prompt: sample.mocks.prompt,
    });

    assert.ok(sample.mocks.prompt.start.calledOnce);
    assert.ok(sample.mocks.prompt.get.calledOnce);
    assert.deepStrictEqual(
      sample.mocks.prompt.get.firstCall.args[0],
      exampleConfig
    );

    await new Promise(r => setTimeout(r, 10));
    assert.ok(sample.mocks.Knex.calledOnce);
    assert.deepStrictEqual(sample.mocks.Knex.firstCall.args, [
      {
        client: 'mysql',
        connection: exampleConfig,
      },
    ]);

    assert.ok(sample.mocks.knex.schema.createTable.calledOnce);
    assert.strictEqual(
      sample.mocks.knex.schema.createTable.firstCall.args[0],
      'visits'
    );

    assert.ok(console.log.calledWith(expectedResult));
    assert.ok(sample.mocks.knex.destroy.calledOnce);
  });

  it('should handle prompt error', async () => {
    const error = new Error('error');
    const sample = getSample();
    sample.mocks.prompt.get = sinon.stub().yields(error);

    proxyquire(SAMPLE_PATH, {
      knex: sample.mocks.Knex,
      prompt: sample.mocks.prompt,
    });

    await new Promise(r => setTimeout(r, 10));
    assert.ok(console.error.calledOnce);
    assert.ok(console.error.calledWith(error));
    assert.ok(sample.mocks.Knex.notCalled);
  });

  it('should handle knex creation error', async () => {
    const error = new Error('error');
    const sample = getSample();
    sample.mocks.knex.schema.createTable = sinon
      .stub()
      .returns(Promise.reject(error));

    proxyquire(SAMPLE_PATH, {
      knex: sample.mocks.Knex,
      prompt: sample.mocks.prompt,
    });
    await new Promise(r => setTimeout(r, 10));
    assert.ok(console.error.calledOnce);
    assert.ok(
      console.error.calledWith("Failed to create 'visits' table:", error)
    );
    assert.ok(sample.mocks.knex.destroy.calledOnce);
  });
});
