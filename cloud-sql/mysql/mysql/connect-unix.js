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
// [START cloud_sql_mysql_mysql_connect_unix]
const mysql = require('promise-mysql');

// createUnixSocketPool initializes a Unix socket connection pool for
// a Cloud SQL instance of SQL Server.
const createUnixSocketPool = async config => {
  const dbSocketPath = process.env.INSTANCE_UNIX_SOCKET;

  // Establish a connection to the database.
  return mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    // If connecting via unix domain socket, specify the path
    socketPath: dbSocketPath,
    // Specify additional properties here.
    ...config,
  });
};
// [END cloud_sql_mysql_mysql_connect_unix]
module.exports = createUnixSocketPool;
