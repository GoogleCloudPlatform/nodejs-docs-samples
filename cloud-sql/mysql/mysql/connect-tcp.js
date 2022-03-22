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
// [START cloud_sql_mysql_mysql_connect_tcp]
const mysql = require('promise-mysql');
const fs = require('fs');

const createTcpPool = async config => {
  // Extract host and port from socket address
  const dbSocketAddr = process.env.INSTANCE_HOST.split(':');
  const dbConfig = {
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    host: dbSocketAddr[0], // e.g. '127.0.0.1'
    port: dbSocketAddr[1], // e.g. '3306'
    // ... Specify additional properties here.
    ...config,
  };
  // [START_EXCLUDE]
  // [START cloud_sql_mysql_mysql_connect_tcp_sslcerts]
  // (OPTIONAL) Configure SSL certificates
  // For deployments that connect directly to a Cloud SQL instance without
  // using the Cloud SQL Proxy, configuring SSL certificates will ensure the
  // connection is encrypted. This step is entirely OPTIONAL.
  if (process.env.DB_ROOT_CERT) {
    dbConfig.ssl = {
      sslmode: 'verify-full',
      ca: fs.readFileSync(process.env.DB_ROOT_CERT), // e.g., '/path/to/my/server-ca.pem'
      key: fs.readFileSync(process.env.DB_KEY), // e.g. '/path/to/my/client-key.pem'
      cert: fs.readFileSync(process.env.DB_CERT), // e.g. '/path/to/my/client-cert.pem'
    };
  }
  // [END cloud_sql_mysql_mysql_connect_tcp_sslcerts]
  // [END_EXCLUDE]
  // Establish a connection to the database
  return mysql.createPool(dbConfig);
};
// [END cloud_sql_mysql_mysql_connect_tcp]
module.exports = createTcpPool;
