// Copyright 2023 Google LLC
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
// [START cloud_sql_sqlserver_tedious_connect_tcp]
const {Connection} = require('tedious');

// connectWithConnector initializes a TCP connection
// to a Cloud SQL instance of SQL Server.
const connectWithTcpSocket = async config => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const dbConfig = {
    server: process.env.INSTANCE_HOST, // e.g. '127.0.0.1'
    authentication: {
      type: 'default',
      options: {
        userName: process.env.DB_USER, // e.g. 'my-db-user'
        password: process.env.DB_PASS, // e.g. 'my-db-password'
      },
    },
    options: {
      port: parseInt(process.env.DB_PORT), // e.g. 1433
      database: process.env.DB_NAME, // e.g. 'my-database'
      useColumnNames: true,
      encrypt: false,
    },
    // ... Specify additional properties here.
    ...config,
  };
  // [END cloud_sql_sqlserver_tedious_connect_tcp]

  // (OPTIONAL) Configure encrypted connection
  // For deployments that connect directly to a Cloud SQL instance without
  // using the Cloud SQL Proxy, configure encrypted connection.
  if (process.env.PRIVATE_IP === '1' || process.env.PRIVATE_IP === 'true') {
    dbConfig.options.encrypt = true;
    dbConfig.options.private = true;
  }

  // [START cloud_sql_sqlserver_tedious_connect_tcp]
  // Establish a connection to the database.
  return new Connection(dbConfig);
};
// [END cloud_sql_sqlserver_tedious_connect_tcp]
module.exports = connectWithTcpSocket;
