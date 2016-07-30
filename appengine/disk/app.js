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
var fs = require('fs');
var express = require('express');
var crypto = require('crypto');
var path = require('path');

var app = express();
app.enable('trust proxy');

var FILENAME = path.join(__dirname, 'seen.txt');
// [END setup]

// [START insertVisit]
/**
 * Store a visit record on disk.
 *
 * @param {object} visit The visit record to insert.
 * @param {function} callback The callback function.
 */
function insertVisit (visit, callback) {
  fs.appendFile(FILENAME, JSON.stringify(visit) + '\n', function (err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
}
// [END insertVisit]

// [START getVisits]
/**
 * Retrieve the latest 10 visit records from disk.
 *
 * @param {function} callback The callback function.
 */
function getVisits (callback) {
  fs.readFile(FILENAME, { encoding: 'utf8' }, function (err, data) {
    if (err) {
      return callback(err);
    }

    var visits = data.split('\n')
      .filter(function (line) {
        return line;
      })
      .map(function (line) {
        var visit = JSON.parse(line);
        return 'Time: ' + visit.timestamp + ', AddrHash: ' + visit.userIp;
      });

    return callback(null, visits);
  });
}
// [END getVisits]

app.get('/', function (req, res, next) {
  // Create a visit record to be stored on disk
  var visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 7)
  };

  insertVisit(visit, function (err) {
    if (err) {
      return next(err);
    }

    // Query the last 10 visits from disk.
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
