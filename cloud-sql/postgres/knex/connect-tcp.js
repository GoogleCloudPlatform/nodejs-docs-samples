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
// [START cloud_sql_postgres_knex_connect_tcp]
// [START cloud_sql_postgres_knex_connect_tcp_sslcerts]
const Knex = require('knex');
const fs = require('fs');

// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of Postgres.
const createTcpPool = async config => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const dbConfig = {
    client: 'pg',
    connection: {
      host: process.env.INSTANCE_HOST, // e.g. '127.0.0.1'
      port: process.env.DB_PORT, // e.g. '5432'
      user: process.env.DB_USER, // e.g. 'my-user'
      password: process.env.DB_PASS, // e.g. 'my-user-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
    },
    // ... Specify additional properties here.
    ...config,
  };
  // [END cloud_sql_postgres_knex_connect_tcp]

  // (OPTIONAL) Configure SSL certificates
  // For deployments that connect directly to a Cloud SQL instance without
  // using the Cloud SQL Proxy, configuring SSL certificates will ensure the
  // connection is encrypted.
  if (process.env.DB_ROOT_CERT) {
    dbConfig.ssl = {
      rejectUnauthorized: false,
      ca: fs.readFileSync(process.env.DB_ROOT_CERT), // e.g., '/path/to/my/server-ca.pem'
      key: fs.readFileSync(process.env.DB_KEY), // e.g. '/path/to/my/client-key.pem'
      cert: fs.readFileSync(process.env.DB_CERT), // e.g. '/path/to/my/client-cert.pem'
    };
  }
  // [END cloud_sql_postgres_knex_connect_tcp_sslcerts]
  // [START cloud_sql_postgres_knex_connect_tcp]
  // Establish a connection to the database.
  return Knex(dbConfig);
};
// [END cloud_sql_postgres_knex_connect_tcp]
module.exports = createTcpPool;
