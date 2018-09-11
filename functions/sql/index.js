/**
 * Copyright 2018, Google LLC.
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

const process = require('process'); // Allow env variable mocking

// [START functions_sql_mysql]
const mysql = require('mysql');
// [END functions_sql_mysql]

// [START functions_sql_postgres]
const pg = require('pg');
// [END functions_sql_postgres]

// [START functions_sql_mysql]
// [START functions_sql_postgres]

/**
 * TODO(developer): specify SQL connection details
 */
const connectionName = process.env.INSTANCE_CONNECTION_NAME || '<YOUR INSTANCE CONNECTION NAME>';
const dbUser = process.env.SQL_USER || '<YOUR DB USER>';
const dbPassword = process.env.SQL_PASSWORD || '<YOUR DB PASSWORD>';
const dbName = process.env.SQL_NAME || '<YOUR DB NAME>';

// [END functions_sql_postgres]
// [END functions_sql_mysql]

// [START functions_sql_mysql]
const mysqlConfig = {
  connectionLimit: 1,
  user: dbUser,
  password: dbPassword,
  database: dbName
};
if (process.env.NODE_ENV === 'production') {
  mysqlConfig.socketPath = `/cloudsql/${connectionName}`;
}

const mysqlPool = mysql.createPool(mysqlConfig);

exports.mysqlDemo = (req, res) => {
  mysqlPool.query('SELECT NOW() AS now', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(results));
    }
  });
};
// [END functions_sql_mysql]

// [START functions_sql_postgres]
const pgConfig = {
  max: 1,
  user: dbUser,
  password: dbPassword,
  database: dbName
};

if (process.env.NODE_ENV === 'production') {
  pgConfig.socketPath = `/cloudsql/${connectionName}`;
}

const pgPool = new pg.Pool(pgConfig);

exports.postgresDemo = (req, res) => {
  pgPool.query('SELECT NOW() as now', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(results));
    }
  });
};
// [END functions_sql_postgres]
