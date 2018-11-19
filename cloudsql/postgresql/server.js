/**
 * Copyright 2018, Google, Inc.
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

const express = require('express');
const bodyParser = require('body-parser');
const Knex = require('knex');

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');

// Automatically parse request body as form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set Content-Type for all responses for these routes
app.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
  });

// Create a Winston logger that streams to Stackdriver Logging
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    loggingWinston,
  ],
});

// [START cloud_sql_postgreSQL_connection_pool]
// Initialize Knex, a Node.js SQL query builder library with built-in connection pooling
const knex = connect();

function connect () {
  // Configure which instance and what database user to connect with.
  // Note: saving credentials in environment variables is convenient, but not secure - consider a more
  // secure solution such as https://cloud.google.com/kms/ to help keep secrets safe.
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };
  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

  // Establish a connection to the database
  const knex = Knex({
    client: 'pg',
    connection: config
  });

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
  knex.client.pool.createTimeoutMillis= 30000; // 30 seconds
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

  return knex;
  // [END cloud_sql_postgreSQL_connection_pool]
}

// [START cloud_sql_example_statement]
/**
 * Insert a vote record into the database.
 *
 * @param {object} knex The Knex connection object.
 * @param {object} vote The vote record to insert.
 * @returns {Promise}
 */
function insertVote (knex, vote) {
  return knex('votes').insert(vote);
}
// [END cloud_sql_example_statement]

/**
 * Retrieve the latest 5 vote records from the database.
 *
 * @param {object} knex The Knex connection object.
 * @returns {Promise}
 */
function getVotes (knex) {
  return knex.select('candidate', 'time_cast')
    .from('votes')
    .orderBy('time_cast', 'desc')
    .limit(5)
    .then((results) => {
      return results;
    });
}

/**
 * Retrieve the total count of records for a given candidate
 * from the database.
 * 
 * @param {object} knex The Knex connection object.
 * @param {object} candidate The candidate for which to get the total vote count
 * @returns {Promise}
 */
function getVoteCount (knex, candidate) {
  return knex('votes')
    .count('vote_id')
    .where('candidate', candidate)
    .then((result) => {
      return result;
    });
}

app.get('/', (req, res, next) => {
  var tabsTotalVotes;
  var spacesTotalVotes;
  // Query the total count of "TABS" from the database.
  getVoteCount(knex, 'TABS') 
  .then((tabsResult) => {
    tabsTotalVotes = parseInt(tabsResult[0].count);
    // Query the total count of "SPACES" from the database.
    getVoteCount(knex, 'SPACES') 
    .then((spacesResult) => {
      spacesTotalVotes = parseInt(spacesResult[0].count);
      // Query the last 5 votes from the database.
      getVotes(knex) 
      .then((votes) => {
        // Calculate and set leader values.
        var leadTeam = "";
        var voteDiff = 0;
        var leaderMessage = "";     
        if (tabsTotalVotes != spacesTotalVotes) {
          if (tabsTotalVotes > spacesTotalVotes) {
            leadTeam = "TABS";
            voteDiff = tabsTotalVotes - spacesTotalVotes;
          }
          else
          {
            leadTeam = "SPACES";
            voteDiff = spacesTotalVotes - tabsTotalVotes;
          }
          leaderMessage = leadTeam + " are winning by " + voteDiff;
          leaderMessage += voteDiff > 1 ? " votes." : " vote.";
        }
        else
        {
          leaderMessage = "TABS and SPACES are evenly matched!";
        }
        res.render('index.pug', {
              votes: votes,
              tabsCount: tabsTotalVotes,
              spacesCount: spacesTotalVotes,
              leadTeam: leadTeam,
              voteDiff : voteDiff,
              leaderMessage : leaderMessage
        });
      });
    });
  });
});

app.post('/', (req, res, next) => {
  // [START cloud_sql_example_statement]
  // Get the team from the request and record the time of the vote.
  const team = req.body.team;
  const timestamp = new Date();

  if (!team || (team != 'TABS' && team != 'SPACES')) {
    res
      .status(400)
      .send("Invalid team specified.")
      .end();
  }

  // Create a vote record to be stored in the database
  const vote = {
    candidate: team,
    time_cast: timestamp
  };

  // Save the data to the database.
  insertVote(knex, vote)  
  .then(() => {
    var msg = "Successfully voted for " + team + " at " + timestamp;
    res
      .status(200)
      .send(msg)
      .end();
    })
  // [END cloud_sql_example_statement]  
    .catch((err) => {
      logger.error("Error while attempting to submit vote. Error:" + err);
      var msg = "Unable to successfully cast vote!";
      msg += "Please check the application logs for more details.";        
      res
        .status(500)
        .send(msg)
        .end();
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;