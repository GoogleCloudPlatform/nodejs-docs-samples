// Copyright 2018 Google LLC
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
const Knex = require('knex');
const {exec} = require('child_process');

const cwd = path.join(__dirname, '..');

const {DB_USER, DB_PASS, DB_NAME, CONNECTION_NAME, DB_HOST} = process.env;
const SOCKET_PATH = process.env.DB_SOCKET_PATH || '/cloudsql';

before(async () => {
  const connection = {
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  };

  if (DB_HOST) {
    const dbSocketAddr = process.env.DB_HOST.split(':');
    connection.host = dbSocketAddr[0];
    connection.port = dbSocketAddr[1];
  } else {
    connection.host = `${SOCKET_PATH}/${CONNECTION_NAME}`;
  }

  try {
    const knex = Knex({
      client: 'pg',
      connection,
    });
    await knex.schema.dropTable('votes');
  } catch (err) {
    console.log(err.message);
  }
});

it('should create a table', done => {
  exec(
    `node createTable.js ${DB_USER} ${DB_PASS} ${DB_NAME} ${CONNECTION_NAME} ${DB_HOST}`,
    {cwd},
    (err, stdout) => {
      assert.ok(stdout.includes("Successfully created 'votes' table."));
      done();
    }
  );
});

it('should handle existing tables', done => {
  exec(
    `node createTable.js ${DB_USER} ${DB_PASS} ${DB_NAME} ${CONNECTION_NAME} ${DB_HOST}`,
    {cwd},
    (err, stdout, stderr) => {
      assert.ok(stderr.includes("Failed to create 'votes' table:"));
      assert.ok(stderr.includes('already exists'));
      done();
    }
  );
});
