// Copyright 2022 Google LLC
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
// [START cloud_sql_postgres_knex_connect_unix]
const Knex = require('knex');

const createUnixSocketPool = async config => {
  const dbSocketPath = process.env.INSTANCE_UNIX_SOCKET;

  // Establish a connection to the database
  return Knex({
    client: 'pg',
    connection: {
      user: process.env.DB_USER, // e.g. 'my-user'
      password: process.env.DB_PASS, // e.g. 'my-user-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
      host: dbSocketPath,
    },
    // ... Specify additional properties here.
    ...config,
  });
};
// [END cloud_sql_postgres_knex_connect_unix]
module.exports = createUnixSocketPool;
