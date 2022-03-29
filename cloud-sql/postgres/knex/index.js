// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const express = require('express');
const createTcpPool = require('./connect-tcp.js');
const createUnixSocketPool = require('./connect-unix.js');

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(express.urlencoded({extended: false}));
// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

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

// Retrieve and return a specified secret from Secret Manager
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function accessSecretVersion(secretName) {
  const [version] = await client.accessSecretVersion({name: secretName});
  return version.payload.data;
}

// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool;

app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await createPoolAndEnsureSchema();
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Initialize Knex, a Node.js SQL query builder library with built-in connection pooling.
const createPool = async () => {
  // Configure which instance and what database user to connect with.
  // Remember - storing secrets in plaintext is potentially unsafe. Consider using
  // something like https://cloud.google.com/kms/ to help keep secrets secret.
  const config = {pool: {}};

  // [START cloud_sql_postgres_knex_limit]
  // 'max' limits the total number of concurrent connections this pool will keep. Ideal
  // values for this setting are highly variable on app design, infrastructure, and database.
  config.pool.max = 5;
  // 'min' is the minimum number of idle connections Knex maintains in the pool.
  // Additional connections will be established to meet this value unless the pool is full.
  config.pool.min = 5;
  // [END cloud_sql_postgres_knex_limit]

  // [START cloud_sql_postgres_knex_timeout]
  // 'acquireTimeoutMillis' is the number of milliseconds before a timeout occurs when acquiring a
  // connection from the pool. This is slightly different from connectionTimeout, because acquiring
  // a pool connection does not always involve making a new connection, and may include multiple retries.
  // when making a connection
  config.pool.acquireTimeoutMillis = 60000; // 60 seconds
  // 'createTimeoutMillis` is the maximum number of milliseconds to wait trying to establish an
  // initial connection before retrying.
  // After acquireTimeoutMillis has passed, a timeout exception will be thrown.
  config.pool.createTimeoutMillis = 30000; // 30 seconds
  // 'idleTimeoutMillis' is the number of milliseconds a connection must sit idle in the pool
  // and not be checked out before it is automatically closed.
  config.pool.idleTimeoutMillis = 600000; // 10 minutes
  // [END cloud_sql_postgres_knex_timeout]

  // [START cloud_sql_postgres_knex_backoff]
  // 'knex' uses a built-in retry strategy which does not implement backoff.
  // 'createRetryIntervalMillis' is how long to idle after failed connection creation before trying again
  config.pool.createRetryIntervalMillis = 200; // 0.2 seconds
  // [END cloud_sql_postgres_knex_backoff]

  // Check if a Secret Manager secret version is defined
  // If a version is defined, retrieve the secret from Secret Manager and set as the DB_PASS
  const {CLOUD_SQL_CREDENTIALS_SECRET} = process.env;
  if (CLOUD_SQL_CREDENTIALS_SECRET) {
    const secrets = await accessSecretVersion(CLOUD_SQL_CREDENTIALS_SECRET);
    try {
      process.env.DB_PASS = secrets.toString();
    } catch (err) {
      err.message = `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: \n ${err.message} `;
      throw err;
    }
  }

  if (process.env.INSTANCE_HOST) {
    // Use a TCP socket when INSTANCE_HOST (e.g., 127.0.0.1) is defined
    return createTcpPool(config);
  } else if (process.env.INSTANCE_UNIX_SOCKET) {
    // Use a Unix socket when INSTANCE_UNIX_SOCKET (e.g., /cloudsql/proj:region:instance) is defined.
    return createUnixSocketPool(config);
  } else {
    throw 'One of INSTANCE_HOST or INSTANCE_UNIX_SOCKET` is required.';
  }
};

const ensureSchema = async pool => {
  const hasTable = await pool.schema.hasTable('votes');
  if (!hasTable) {
    return pool.schema.createTable('votes', table => {
      table.increments('vote_id').primary();
      table.timestamp('time_cast', 30).notNullable();
      table.specificType('candidate', 'CHAR(6)').notNullable();
    });
  }
  logger.info("Ensured that table 'votes' exists");
};

const createPoolAndEnsureSchema = async () =>
  await createPool()
    .then(async pool => {
      await ensureSchema(pool);
      return pool;
    })
    .catch(err => {
      logger.error(err);
      throw err;
    });

// [START cloud_sql_postgres_knex_connection]
/**
 * Insert a vote record into the database.
 *
 * @param {object} pool The Knex connection object.
 * @param {object} vote The vote record to insert.
 * @returns {Promise}
 */
const insertVote = async (pool, vote) => {
  try {
    return await pool('votes').insert(vote);
  } catch (err) {
    throw Error(err);
  }
};
// [END cloud_sql_postgres_knex_connection]

/**
 * Retrieve the latest 5 vote records from the database.
 *
 * @param {object} pool The Knex connection object.
 * @returns {Promise}
 */
const getVotes = async pool => {
  return await pool
    .select('candidate', 'time_cast')
    .from('votes')
    .orderBy('time_cast', 'desc')
    .limit(5);
};

/**
 * Retrieve the total count of records for a given candidate
 * from the database.
 *
 * @param {object} pool The Knex connection object.
 * @param {object} candidate The candidate for which to get the total vote count
 * @returns {Promise}
 */
const getVoteCount = async (pool, candidate) => {
  return await pool('votes').count('vote_id').where('candidate', candidate);
};

const httpGet = async (req, res) => {
  pool = pool || (await createPoolAndEnsureSchema());
  try {
    // Query the total count of "TABS" from the database.
    const tabsResult = await getVoteCount(pool, 'TABS');
    const tabsTotalVotes = parseInt(tabsResult[0].count);
    // Query the total count of "SPACES" from the database.
    const spacesResult = await getVoteCount(pool, 'SPACES');
    const spacesTotalVotes = parseInt(spacesResult[0].count);
    // Query the last 5 votes from the database.
    const votes = await getVotes(pool);
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
      leaderMessage =
        `${leadTeam} are winning by ${voteDiff} vote` + voteDiff > 1 ? 's' : '';
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
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send('Unable to load page; see logs for more details.')
      .end();
  }
};

app.get('/', httpGet);

const httpPost = async (req, res) => {
  pool = pool || (await createPoolAndEnsureSchema());
  // Get the team from the request and record the time of the vote.
  const {team} = req.body;
  const timestamp = new Date();

  if (!team || (team !== 'TABS' && team !== 'SPACES')) {
    res.status(400).send('Invalid team specified.').end();
    return;
  }

  // Create a vote record to be stored in the database.
  const vote = {
    candidate: team,
    time_cast: timestamp,
  };

  // Save the data to the database.
  try {
    await insertVote(pool, vote);
  } catch (err) {
    logger.error(`Error while attempting to submit vote:${err}`);
    res
      .status(500)
      .send('Unable to cast vote; see logs for more details.')
      .end();
    return;
  }
  res.status(200).send(`Successfully voted for ${team} at ${timestamp}`).end();
};

app.post('*', httpPost);

/**
 * Responds to GET and POST requests for TABS vs SPACES sample app.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.votes = (req, res) => {
  switch (req.method) {
    case 'GET':
      httpGet(req, res);
      break;
    case 'POST':
      httpPost(req, res);
      break;
    default:
      res.status(405).send({error: 'Something blew up!'});
      break;
  }
};

module.exports = app;
