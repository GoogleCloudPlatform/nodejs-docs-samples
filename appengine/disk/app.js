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
const fs = require('fs');
const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.enable('trust proxy');

const FILENAME = path.join(__dirname, 'seen.txt');
// [END setup]

// [START insertVisit]
/**
 * Store a visit record on disk.
 *
 * @param {object} visit The visit record to insert.
 * @param {function} callback The callback function.
 */
function insertVisit (visit, callback) {
  fs.appendFile(FILENAME, `${JSON.stringify(visit)}\n`, (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback();
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
  fs.readFile(FILENAME, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      callback(err);
      return;
    }

    const visits = data.split('\n')
      .filter((line) => line)
      .map(JSON.parse)
      .map((visit) => `Time: ${visit.timestamp}, AddrHash: ${visit.userIp}`);

    callback(null, visits);
  });
}
// [END getVisits]

app.get('/', (req, res, next) => {
  // Create a visit record to be stored on disk
  const visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 7)
  };

  insertVisit(visit, (err) => {
    if (err) {
      next(err);
      return;
    }

    // Query the last 10 visits from disk.
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
