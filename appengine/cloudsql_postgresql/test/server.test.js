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

const express = require('express');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const SAMPLE_PATH = path.join(__dirname, '../server.js');

function getSample() {
  const testApp = express();
  sinon.stub(testApp, 'listen').yields();
  const expressMock = sinon.stub().returns(testApp);
  const resultsMock = [
    {
      timestamp: '1234',
      userIp: 'abcd',
    },
  ];

  const knexMock = sinon.stub().returns({
    insert: sinon.stub().returns(Promise.resolve()),
  });
  Object.assign(knexMock, {
    select: sinon.stub().returnsThis(),
    from: sinon.stub().returnsThis(),
    orderBy: sinon.stub().returnsThis(),
    limit: sinon.stub().returns(Promise.resolve(resultsMock)),
  });

  const KnexMock = sinon.stub().returns(knexMock);

  const processMock = {
    env: {
      SQL_USER: 'user',
      SQL_PASSWORD: 'password',
      SQL_DATABASE: 'database',
    },
  };

  const app = proxyquire(SAMPLE_PATH, {
    knex: KnexMock,
    express: expressMock,
    process: processMock,
  });

  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      knex: knexMock,
      Knex: KnexMock,
      process: processMock,
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('should set up sample in Postgres', () => {
  const sample = getSample();

  assert.strictEqual(sample.mocks.express.calledOnce, true);
  assert.strictEqual(sample.mocks.Knex.calledOnce, true);
  assert.deepStrictEqual(sample.mocks.Knex.firstCall.args, [
    {
      client: 'pg',
      connection: {
        user: sample.mocks.process.env.SQL_USER,
        password: sample.mocks.process.env.SQL_PASSWORD,
        database: sample.mocks.process.env.SQL_DATABASE,
      },
    },
  ]);
});

it('should record a visit', async () => {
  const sample = getSample();
  const expectedResult = 'Last 10 visits:\nTime: 1234, AddrHash: abcd';

  await request(sample.app)
    .get('/')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, expectedResult);
    });
});

it('should handle insert error', async () => {
  const sample = getSample();
  const expectedResult = 'insert_error';

  sample.mocks.knex.limit.returns(Promise.reject(expectedResult));

  await request(sample.app)
    .get('/')
    .expect(500)
    .expect(response => {
      assert.strictEqual(response.text.includes(expectedResult), true);
    });
});

it('should handle read error', async () => {
  const sample = getSample();
  const expectedResult = 'read_error';

  sample.mocks.knex.limit.returns(Promise.reject(expectedResult));

  await request(sample.app)
    .get('/')
    .expect(500)
    .expect(response => {
      assert.strictEqual(response.text.includes(expectedResult), true);
    });
});
