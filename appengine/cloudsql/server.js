// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

// [START setup]
var express = require('express');
var mysql = require('mysql');
var crypto = require('crypto');

var app = express();
app.enable('trust proxy');
// [END setup]

// [START connect]
// Connect to the database
var connection = mysql.createConnection({
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  socketPath: process.env.MYSQL_SOCKET_PATH,
  database: process.env.MYSQL_DATABASE
});
// [END connect]

// [START insertVisit]
/**
 * Insert a visit record into the database.
 *
 * @param {object} visit The visit record to insert.
 * @param {function} callback The callback function.
 */
function insertVisit (visit, callback) {
  connection.query('INSERT INTO `visits` SET ?', visit, function (err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
}
// [END insertVisit]

// [START getVisits]
var SQL_STRING = 'SELECT `timestamp`, `userIp`\n' +
  'FROM `visits`\n' +
  'ORDER BY `timestamp` DESC\n' +
  'LIMIT 10;';

/**
 * Retrieve the latest 10 visit records from the database.
 *
 * @param {function} callback The callback function.
 */
function getVisits (callback) {
  connection.query(SQL_STRING, function (err, results) {
    if (err) {
      return callback(err);
    }

    return callback(null, results.map(function (visit) {
      return 'Time: ' + visit.timestamp + ', AddrHash: ' + visit.userIp;
    }));
  });
}
// [END getVisits]

app.get('/', function (req, res, next) {
  // Create a visit record to be stored in the database
  var visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 7)
  };

  insertVisit(visit, function (err) {
    if (err) {
      return next(err);
    }

    // Query the last 10 visits from the database.
    getVisits(function (err, visits) {
      if (err) {
        return next(err);
      }

      return res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send('Last 10 visits:\n' + visits.join('\n'));
    });
  });
});

// [START listen]
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log('App listening on port %s', PORT);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
