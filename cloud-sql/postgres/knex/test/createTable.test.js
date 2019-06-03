/**
 * Copyright 2018 Google LLC.
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

const assert = require('assert');
const path = require('path');
const Knex = require('knex');
const tools = require('@google-cloud/nodejs-repo-tools');

const cwd = path.join(__dirname, '..');

const {DB_USER, DB_PASS, DB_NAME} = process.env;
const CONNECTION_NAME = process.env.CLOUD_SQL_CONNECTION_NAME;

before(async () => {
  try {
    const knex = Knex({
      client: 'pg',
      connection: {
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        host: `/cloudsql/${CONNECTION_NAME}`,
      },
    });
    await knex.schema.dropTable('votes');
  } catch (err) {
    console.log(err.message);
  }
});

it('should create a table', async () => {
  const output = await tools.runAsync(
    `node createTable.js ${DB_USER} ${DB_PASS} ${DB_NAME} ${CONNECTION_NAME}`,
    cwd
  );
  assert.ok(output.includes(`Successfully created 'votes' table.`));
});

it('should handle existing tables', async () => {
  const {stderr} = await tools.runAsyncWithIO(
    `node createTable.js ${DB_USER} ${DB_PASS} ${DB_NAME} ${CONNECTION_NAME}`,
    cwd
  );

  assert.ok(stderr.includes("Failed to create 'votes' table:"));
  assert.ok(stderr.includes('already exists'));
});
