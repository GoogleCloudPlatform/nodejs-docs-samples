/**
 * Copyright 2018, Google, LLC.
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

const express = require('express');
const mysql = require('mysql');

const app = express();

const poolConfig = {
  connectionLimit: 3,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE
};

if (process.env.INSTANCE_CONNECTION_NAME &&
    process.env.NODE_ENV === 'production') {
  // If deployed, use the local socket interface for accessing Cloud SQL.
  // If running locally, use the the TCP connection instead.
  // mysql package by default connects to localhost:3306.
  // Set up Cloud SQL Proxy (cloud.google.com/sql/docs/mysql/sql-proxy)
  // so that your application can use localhost:3306 to connect to your
  // Cloud SQL instance.
  poolConfig.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

var pool = mysql.createPool(poolConfig);

app.get(`/`, (req, res, next) => {
  // pool.query() method from the mysql package automatically requests a
  // connection from the pool, run the query, and return the connection back
  // to the pool.
  pool.query(
    `SELECT NOW() as now`,
    function (error, results, fields) {
      if (error) throw error;
      var now = results[0].now;
      res
        .status(200)
        .send(`Current time: ${now}`)
        .end();
    }
  );
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
