// Copyright 2020 Google LLC
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
const mssql = require('mssql');
const bodyParser = require('body-parser');

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

// [START cloud_sql_sqlserver_mssql_create]
const createPool = async () => {
  const config = {pool: {}};
  config.user = process.env.DB_USER; // e.g. 'my-db-user'
  config.password = process.env.DB_PASS; // e.g. 'my-db-password'
  config.database = process.env.DB_NAME; // e.g. 'my-database'
  // set the server to '172.17.0.1' when connecting from App Engine Flex
  config.server = process.env.DEPLOYED ? '172.17.0.1' : '127.0.0.1';
  config.port = 1433;

  // [START_EXCLUDE]

  // [START cloud_sql_sqlserver_mssql_timeout]
  // 'connectionTimeout` is the maximum number of milliseconds to wait trying to establish an
  // initial connection. After the specified amount of time, an exception will be thrown.
  config.connectionTimeout = 30000;
  // 'acquireTimeoutMillis' is the number of milliseconds before a timeout occurs when acquiring a
  // connection from the pool.
  config.pool.acquireTimeoutMillis = 30000;
  // 'idleTimeoutMillis' is the number of milliseconds a connection must sit idle in the pool
  // and not be checked out before it is automatically closed
  (config.pool.idleTimeoutMillis = 600000),
    // [END cloud_sql_sqlserver_mssql_timeout]

    // [START cloud_sql_sqlserver_mssql_limit]
    // 'max' limits the total number of concurrent connections this pool will keep. Ideal
    // values for this setting are highly variable on app design, infrastructure, and database.
    (config.pool.max = 5);
  // 'min' is the minimum number of idle connections maintained in the pool.
  // Additional connections will be established to meet this value unless the pool is full.
  config.pool.min = 1;
  // [END cloud_sql_sqlserver_mssql_limit]

  // [START cloud_sql_sqlserver_mssql_backoff]
  // The node-mssql module uses a built-in retry strategy which does not implement backoff.
  // 'createRetryIntervalMillis' is the number of milliseconds to wait in between retries.
  config.pool.createRetryIntervalMillis = 200;
  // [END cloud_sql_sqlserver_mssql_backoff]

  // [END_EXCLUDE]
  return await mssql.connect(config);
};
// [END cloud_sql_sqlserver_mssql_create]

const ensureSchema = async pool => {
  // Wait for tables to be created (if they don't already exist).
  await pool.request().query(
    `IF NOT EXISTS (
        SELECT * FROM sysobjects WHERE name='votes' and xtype='U')
      CREATE TABLE votes (
        vote_id INT NOT NULL IDENTITY,
        time_cast DATETIME NOT NULL,
        candidate VARCHAR(6) NOT NULL,
        PRIMARY KEY (vote_id));`
  );
  console.log("Ensured that table 'votes' exists");
};

let pool;
const poolPromise = createPool()
  .then(async pool => {
    await ensureSchema(pool);
    return pool;
  })
  .catch(err => {
    logger.error(err);
    throw err;
  });

app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await poolPromise;
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Serve the index page, showing vote tallies.
app.get('/', async (req, res) => {
  try {
    // Get the 5 most recent votes.
    const recentVotesQuery = pool
      .request()
      .query(
        'SELECT TOP(5) candidate, time_cast FROM votes ORDER BY time_cast DESC'
      );

    // Get votes
    const stmt =
      'SELECT COUNT(vote_id) as count FROM votes WHERE candidate=@candidate';

    const tabsQuery = pool
      .request()
      .input('candidate', mssql.VarChar(6), 'TABS')
      .query(stmt);

    const spacesQuery = pool
      .request()
      .input('candidate', mssql.VarChar(6), 'SPACES')
      .query(stmt);

    // Run queries concurrently, and wait for them to complete
    // This is faster than await-ing each query object as it is created

    const recentVotes = await recentVotesQuery;
    const tabsVotes = await tabsQuery;
    const spacesVotes = await spacesQuery;

    res.render('index.pug', {
      recentVotes: recentVotes.recordset,
      tabCount: tabsVotes.recordset[0].count,
      spaceCount: spacesVotes.recordset[0].count,
    });
  } catch (err) {
    logger.error(err);
    res
      .status(500)
      .send(
        'Unable to load page. Please check the application logs for more details.'
      )
      .end();
  }
});

// Handle incoming vote requests and inserting them into the database.
app.post('/', async (req, res) => {
  const {team} = req.body;
  const timestamp = new Date();

  if (!team || (team !== 'TABS' && team !== 'SPACES')) {
    return res.status(400).send('Invalid team specified.').end();
  }

  // [START cloud_sql_sqlserver_mssql_connection]
  try {
    const stmt =
      'INSERT INTO votes (time_cast, candidate) VALUES (@timestamp, @team)';
    // Using a prepared statement protects against SQL injection attacks.
    // When prepare is called, a single connection is acquired from the connection pool
    // and all subsequent executions are executed exclusively on this connection.
    const ps = new mssql.PreparedStatement(pool);
    ps.input('timestamp', mssql.DateTime);
    ps.input('team', mssql.VarChar(6));
    await ps.prepare(stmt);
    await ps.execute({
      timestamp: timestamp,
      team: team,
    });
    await ps.unprepare();
  } catch (err) {
    // If something goes wrong, handle the error in this section. This might
    // involve retrying or adjusting parameters depending on the situation.
    // [START_EXCLUDE]

    logger.error(err);
    return res
      .status(500)
      .send(
        'Unable to successfully cast vote! Please check the application logs for more details.'
      )
      .end();
    // [END_EXCLUDE]
  }
  // [END cloud_sql_sqlserver_mssql_connection]

  res.status(200).send(`Successfully voted for ${team} at ${timestamp}`).end();
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

const environment = process.env.NODE_ENV || 'development';
if (environment === 'development') {
  process.on('unhandledRejection', err => {
    console.error(err);
    throw err;
  });
}

module.exports = server;
