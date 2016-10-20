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

// [START createTables]
'use strict';

// [START setup]
var mysql = require('mysql');
var prompt = require('prompt');
// [END setup]

// [START createTable]
var SQL_STRING = 'CREATE TABLE `visits` (\n' +
  '  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n' +
  '  `timestamp` DATETIME NULL,\n' +
  '  `userIp` VARCHAR(46) NULL,\n' +
  '  PRIMARY KEY (`id`)\n' +
  ');';

/**
 * Create the "visits" table.
 *
 * @param {object} connection A mysql connection object.
 * @param {function} callback The callback function.
 */
function createTable (connection, callback) {
  connection.query(SQL_STRING, callback);
}
// [END createTable]

// [START getConnection]
var FIELDS = ['socketPath', 'user', 'password', 'database'];

/**
 * Ask the user for connection configuration and create a new connection.
 *
 * @param {function} callback The callback function.
 */
function getConnection (callback) {
  prompt.start();
  prompt.get(FIELDS, function (err, config) {
    if (err) {
      return callback(err);
    }

    return callback(null, mysql.createConnection({
      user: config.user,
      password: config.password,
      socketPath: config.socketPath,
      database: config.database
    }));
  });
}
// [END getConnection]

// [START main]
getConnection(function (err, connection) {
  console.log(err, !!connection);
  if (err) {
    return console.error(err);
  }
  createTable(connection, function (err, result) {
    console.log(err, !!result);
    if (err) {
      return console.error(err);
    }
    console.log(result);
    connection.end();
  });
});
// [END main]
// [END createTables]
