/**
 * Copyright 2016, Google, Inc.
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

// [START app]
'use strict';

// [START setup]
const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');

const app = express();
app.enable('trust proxy');
// [END setup]

// [START connect]
var config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

if (process.env.INSTANCE_CONNECTION_NAME) {
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

// Connect to the database
const connection = mysql.createConnection(config);
// [END connect]

// [START insertVisit]
/**
 * Insert a visit record into the database.
 *
 * @param {object} visit The visit record to insert.
 * @param {function} callback The callback function.
 */
function insertVisit (visit, callback) {
  connection.query('INSERT INTO `visits` SET ?', visit, (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback();
  });
}
// [END insertVisit]

// [START getVisits]
const SQL_STRING = `SELECT timestamp, userIp
FROM visits
ORDER BY timestamp DESC
LIMIT 10;`;

/**
 * Retrieve the latest 10 visit records from the database.
 *
 * @param {function} callback The callback function.
 */
function getVisits (callback) {
  connection.query(SQL_STRING, (err, results) => {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results.map((visit) => `Time: ${visit.timestamp}, AddrHash: ${visit.userIp}`));
  });
}
// [END getVisits]

app.get('/', (req, res, next) => {
  // Create a visit record to be stored in the database
  const visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 7)
  };

  insertVisit(visit, (err, results) => {
    if (err) {
      next(err);
      return;
    }

    // Query the last 10 visits from the database.
    getVisits((err, visits) => {
      if (err) {
        next(err);
        return;
      }

      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`Last 10 visits:\n${visits.join('\n')}`);
    });
  });
});

// [START listen]
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
