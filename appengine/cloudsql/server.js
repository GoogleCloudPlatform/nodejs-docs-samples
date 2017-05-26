/**
 * Copyright 2017, Google, Inc.
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

// Require process, so we can mock environment variables
const process = require('process');

// [START app]
// [START setup]
const express = require('express');
const Knex = require('knex');
const crypto = require('crypto');

const app = express();
app.enable('trust proxy');
// [END setup]
let knex;

function connect () {
  // [START connect]
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    if (process.env.SQL_CLIENT === 'mysql') {
      config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    } else if (process.env.SQL_CLIENT === 'pg') {
      config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    }
  }

  // Connect to the database
  const knex = Knex({
    client: process.env.SQL_CLIENT,
    connection: config
  });
  // [END connect]

  return knex;
}

// [START insertVisit]
/**
 * Insert a visit record into the database.
 *
 * @param {object} visit The visit record to insert.
 */
function insertVisit (visit) {
  return knex('visits').insert(visit);
}
// [END insertVisit]

// [START getVisits]
/**
 * Retrieve the latest 10 visit records from the database.
 */
function getVisits () {
  return knex.select('timestamp', 'userIp')
    .from('visits')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .then((results) => {
      return results.map((visit) => `Time: ${visit.timestamp}, AddrHash: ${visit.userIp}`);
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

  insertVisit(visit)
    .then(() => {
      // Query the last 10 visits from the database.
      return getVisits();
    })
    .then((visits) => {
      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`Last 10 visits:\n${visits.join('\n')}`)
        .end();
    })
    .catch((err) => {
      next(err);
    });
});

// Get type of SQL client to use
const sqlClient = process.env.SQL_CLIENT;
if (sqlClient === 'pg' || sqlClient === 'mysql') {
  knex = connect();
} else {
  throw new Error(`The SQL_CLIENT environment variable must be set to lowercase 'pg' or 'mysql'.`);
}

// [START listen]
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
