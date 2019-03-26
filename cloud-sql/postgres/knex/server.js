/**
 * Copyright 2018 Google LLC.
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

// Require process, so we can mock environment variables.
const process = require('process');

const express = require('express');
const bodyParser = require('body-parser');
const Knex = require('knex');

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Content-Type for all responses for these routes.
app.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

// [START cloud_sql_postgres_connection_pool]
// Initialize Knex, a Node.js SQL query builder library with built-in connection pooling.
const knex = connect();

function connect() {
  // Configure which instance and what database user to connect with.
  // Remember - storing secrets in plaintext is potentially unsafe. Consider using
  // something like https://cloud.google.com/kms/ to help keep secrets secret.
  const config = {
    user: process.env.DB_USER, // e.g. 'my-user'
    password: process.env.DB_PASS, // e.g. 'my-user-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
  };

  config.host = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;

  // Establish a connection to the database
  const knex = Knex({
    client: 'pg',
    connection: config,
  });

  // ... Specify additional properties here.
  // [START_EXCLUDE]

  // [START cloud_sql_limit_connections]
  // 'max' limits the total number of concurrent connections this pool will keep. Ideal
  // values for this setting are highly variable on app design, infrastructure, and database.
  knex.client.pool.max = 5;
  // 'min' is the minimum number of idle connections Knex maintains in the pool.
  // Additional connections will be established to meet this value unless the pool is full.
  knex.client.pool.min = 5;
  // [END cloud_sql_limit_connections]
  // [START cloud_sql_connection_timeout]
  // 'acquireTimeoutMillis' is the maximum number of milliseconds to wait for a connection checkout.
  // Any attempt to retrieve a connection from this pool that exceeds the set limit will throw an
  // SQLException.
  knex.client.pool.createTimeoutMillis = 30000; // 30 seconds
  // 'idleTimeoutMillis' is the maximum amount of time a connection can sit in the pool. Connections that
  // sit idle for this many milliseconds are retried if idleTimeoutMillis is exceeded.
  knex.client.pool.idleTimeoutMillis = 600000; // 10 minutes
  // [END cloud_sql_connection_timeout]
  // [START cloud_sql_connection_backoff]
  // 'createRetryIntervalMillis' is how long to idle after failed connection creation before trying again
  knex.client.pool.createRetryIntervalMillis = 200; // 0.2 seconds
  // [END cloud_sql_connection_backoff]
  // [START cloud_sql_connection_lifetime]
  // 'acquireTimeoutMillis' is the maximum possible lifetime of a connection in the pool. Connections that
  // live longer than this many milliseconds will be closed and reestablished between uses. This
  // value should be several minutes shorter than the database's timeout value to avoid unexpected
  // terminations.
  knex.client.pool.acquireTimeoutMillis = 600000; // 10 minutes
  // [START cloud_sql_connection_lifetime]

  // [END_EXCLUDE]
  return knex;
  // [END cloud_sql_postgres_connection_pool]
}

// [START cloud_sql_example_statement]
/**
 * Insert a vote record into the database.
 *
 * @param {object} knex The Knex connection object.
 * @param {object} vote The vote record to insert.
 * @returns {Promise}
 */
async function insertVote(knex, vote) {
  try {
    return await knex('votes').insert(vote);
  } catch (err) {
    throw Error(err);
  }
}
// [END cloud_sql_example_statement]

/**
 * Retrieve the latest 5 vote records from the database.
 *
 * @param {object} knex The Knex connection object.
 * @returns {Promise}
 */
async function getVotes(knex) {
  return await knex
    .select('candidate', 'time_cast')
    .from('votes')
    .orderBy('time_cast', 'desc')
    .limit(5);
}

/**
 * Retrieve the total count of records for a given candidate
 * from the database.
 *
 * @param {object} knex The Knex connection object.
 * @param {object} candidate The candidate for which to get the total vote count
 * @returns {Promise}
 */
async function getVoteCount(knex, candidate) {
  return await knex('votes')
    .count('vote_id')
    .where('candidate', candidate);
}

app.get('/', (req, res) => {
  (async function() {
    // Query the total count of "TABS" from the database.
    const tabsResult = await getVoteCount(knex, 'TABS');
    const tabsTotalVotes = parseInt(tabsResult[0].count);
    // Query the total count of "SPACES" from the database.
    const spacesResult = await getVoteCount(knex, 'SPACES');
    const spacesTotalVotes = parseInt(spacesResult[0].count);
    // Query the last 5 votes from the database.
    const votes = await getVotes(knex);
    // Calculate and set leader values.
    let leadTeam = '';
    let voteDiff = 0;
    let leaderMessage = '';
    if (tabsTotalVotes !== spacesTotalVotes) {
      if (tabsTotalVotes > spacesTotalVotes) {
        leadTeam = 'TABS';
        voteDiff = tabsTotalVotes - spacesTotalVotes;
      } else {
        leadTeam = 'SPACES';
        voteDiff = spacesTotalVotes - tabsTotalVotes;
      }
      leaderMessage = `${leadTeam} are winning by ${voteDiff} vote${
        voteDiff > 1 ? 's' : ''
      }.`;
    } else {
      leaderMessage = 'TABS and SPACES are evenly matched!';
    }
    res.render('index.pug', {
      votes: votes,
      tabsCount: tabsTotalVotes,
      spacesCount: spacesTotalVotes,
      leadTeam: leadTeam,
      voteDiff: voteDiff,
      leaderMessage: leaderMessage,
    });
  })();
});

app.post('/', (req, res) => {
  // [START cloud_sql_example_statement]
  // Get the team from the request and record the time of the vote.
  const team = req.body.team;
  const timestamp = new Date();

  if (!team || (team !== 'TABS' && team !== 'SPACES')) {
    res
      .status(400)
      .send('Invalid team specified.')
      .end();
  }

  // Create a vote record to be stored in the database.
  const vote = {
    candidate: team,
    time_cast: timestamp,
  };

  // Save the data to the database.
  insertVote(knex, vote)
    // [END cloud_sql_example_statement]
    .catch(err => {
      logger.error('Error while attempting to submit vote. Error:' + err);
      let msg = 'Unable to successfully cast vote!';
      msg += 'Please check the application logs for more details.';
      res
        .status(500)
        .send(msg)
        .end();
    });
  const msg = 'Successfully voted for ' + team + ' at ' + timestamp;
  res
    .status(200)
    .send(msg)
    .end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
