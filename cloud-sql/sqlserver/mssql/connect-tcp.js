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
// [START cloud_sql_sqlserver_mssql_connect_tcp]
const mssql = require('mssql');

// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of SQL Server.
const createTcpPool = async config => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const dbConfig = {
    server: process.env.INSTANCE_HOST, // e.g. '127.0.0.1'
    port: parseInt(process.env.DB_PORT), // e.g. 1433
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    options: {
      trustServerCertificate: true,
    },
    // ... Specify additional properties here.
    ...config,
  };
  return await mssql.connect(dbConfig);
};
// [END cloud_sql_sqlserver_mssql_connect_tcp]
module.exports = createTcpPool;
