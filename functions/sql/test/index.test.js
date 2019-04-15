/**
 * Copyright 2018, Google LLC.
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

const sinon = require(`sinon`);
const assert = require(`assert`);
const proxyquire = require(`proxyquire`);

const INSTANCE_PREFIX = `nodejs-docs-samples:us-central1:integration-tests-instance`;

const getProgram = env => {
  return proxyquire(`../`, {
    process: {
      env: env,
    },
  });
};

it('should query MySQL', async () => {
  const program = getProgram({
    INSTANCE_CONNECTION_NAME: `${INSTANCE_PREFIX}-mysql`,
    SQL_USER: process.env.MYSQL_USER,
    SQL_PASSWORD: process.env.MYSQL_PASSWORD,
    SQL_NAME: process.env.MYSQL_DATABASE,
  });

  const resMock = {
    status: sinon.stub().returnsThis(),
    send: sinon.stub(),
  };

  program.mysqlDemo(null, resMock);

  // Give the query time to complete
  await new Promise(resolve => {
    setTimeout(resolve, 1500);
  });

  assert.strictEqual(resMock.status.called, false);
  assert.ok(resMock.send.calledOnce);

  const response = resMock.send.firstCall.args[0];
  assert.ok(new RegExp(/\d{4}-\d{1,2}-\d{1,2}/).test(response.message));
});

it('should query Postgres', async () => {
  const program = getProgram({
    INSTANCE_CONNECTION_NAME: `${INSTANCE_PREFIX}-pg`,
    SQL_USER: process.env.POSTGRES_USER,
    SQL_PASSWORD: process.env.POSTGRES_PASSWORD,
    SQL_NAME: process.env.POSTGRES_DATABASE,
  });

  const resMock = {
    status: sinon.stub().returnsThis(),
    send: sinon.stub(),
  };

  program.postgresDemo(null, resMock);

  // Give the query time to complete
  await new Promise(resolve => {
    setTimeout(resolve, 1500);
  });

  assert.strictEqual(resMock.status.called, false);
  assert.ok(resMock.send.calledOnce);

  const response = resMock.send.firstCall.args[0];
  assert.ok(new RegExp(/\d{4}-\d{1,2}-\d{1,2}/).test(response.message));
});
