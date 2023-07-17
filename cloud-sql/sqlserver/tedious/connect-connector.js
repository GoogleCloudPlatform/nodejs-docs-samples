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
// [START cloud_sql_sqlserver_tedious_connect_connector]
const {Connection} = require('tedious');
const {Connector} = require('@google-cloud/cloud-sql-connector');

// In case the PRIVATE_IP environment variable is defined then we set
// the ipType=PRIVATE for the new connector instance, otherwise defaults
// to public ip type.
const getIpType = () =>
  process.env.PRIVATE_IP === '1' || process.env.PRIVATE_IP === 'true'
    ? 'PRIVATE'
    : 'PUBLIC';

// connectWithConnector initializes a TCP connection
// to a Cloud SQL instance of SQL Server.
const connectWithConnector = async config => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const connector = new Connector();
  const clientOpts = await connector.getTediousOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: getIpType(),
  });
  const dbConfig = {
    // Please note that the `server` property here is not used and is only
    // defined due to a bug in the tedious driver
    // (ref: https://github.com/tediousjs/tedious/issues/1541)
    // With that in mind, do not try to change this value since it will have no
    // impact in how the connector works, this sample will be updated to remove
    // this property declaration as soon as the tedious driver bug is fixed
    server: '0.0.0.0', // e.g. '127.0.0.1'
    authentication: {
      type: 'default',
      options: {
        userName: process.env.DB_USER, // e.g. 'my-db-user'
        password: process.env.DB_PASS, // e.g. 'my-db-password'
      },
    },
    options: {
      ...clientOpts,
      // Please note that the `port` property here is not used and is only
      // defined due to a bug in the tedious driver
      // (ref: https://github.com/tediousjs/tedious/issues/1541)
      // With that in mind, do not try to change this value since it will have
      // no impact in how the connector works, this sample will be updated to
      // remove this property declaration as soon as the tedious driver bug is
      // fixed
      port: 9999,
      database: process.env.DB_NAME, // e.g. 'my-database'
      useColumnNames: true,
    },
    // ... Specify additional properties here.
    ...config,
  };

  // Establish a connection to the database.
  return new Connection(dbConfig);
};
// [END cloud_sql_sqlserver_tedious_connect_connector]
module.exports = connectWithConnector;
