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

const Knex = require('knex');

const createTable = async config => {
  const socketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
  const tableName = config.tableName;

  // Connect to the database
  if (config.dbHost) {
    const dbSocketAddr = config.dbHost.split(':');
    config.host = dbSocketAddr[0];
    config.port = dbSocketAddr[1];
  } else {
    config.host = `${socketPath}/${config.connectionName}`;
  }

  const knex = Knex({client: 'pg', connection: config});

  // Create the "votes" table
  try {
    await knex.schema.createTable(tableName, table => {
      table.bigIncrements('vote_id').notNull();
      table.timestamp('time_cast').notNull();
      table.specificType('candidate', 'CHAR(6) NOT NULL');
    });

    console.log(`Successfully created '${tableName}' table.`);
    return knex.destroy();
  } catch (err) {
    console.log(`Failed to create '${tableName}' table: ${err}`);
    console.error(`Failed to create '${tableName}' table:`, err);
    if (knex) {
      knex.destroy();
    }
  }
};

require('yargs')
  .command(
    '* <user> <password> <database> <connectionName> <tableName> [dbHost]',
    'Create a table',
    {},
    createTable
  )
  .help().argv;
