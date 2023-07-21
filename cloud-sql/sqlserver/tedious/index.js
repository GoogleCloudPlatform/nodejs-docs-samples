// Copyright 2023 Google LLC
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
const createConnectorConnection = require('./connect-connector.js');
const createTcpConnection = require('./connect-tcp.js');
const getTediousHelper = require('./tedious-helper.js');

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');

// This middleware is available in Express v4.16.0 onwards
// Automatically parse request body as form data.
app.use(express.urlencoded({extended: false}));
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

const createConnection = async () => {
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

  if (process.env.INSTANCE_CONNECTION_NAME) {
    return createConnectorConnection();
  } else {
    return createTcpConnection();
  }
};

let validSchema = false;
let connection;

const ensureSchema = async () => {
  // Wait for tables to be created (if they don't already exist).
  await connection.query(
    `IF NOT EXISTS (
        SELECT * FROM sysobjects WHERE name='votes' and xtype='U')
      CREATE TABLE votes (
        vote_id INT NOT NULL IDENTITY,
        time_cast DATETIME NOT NULL,
        candidate VARCHAR(6) NOT NULL,
        PRIMARY KEY (vote_id));`
  );
  console.log("Ensured that table 'votes' exists");
  validSchema = true;
};

const connectionPromise = createConnection()
  .then(conn => {
    connection = getTediousHelper(conn);
  })
  .then(() => connection.connect())
  .then(ensureSchema)
  .catch(err => {
    logger.error(err);
    throw err;
  });

app.use(async (req, res, next) => {
  if (validSchema) {
    return next();
  }
  try {
    await connectionPromise;
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Serve the index page, showing vote tallies.
const httpGet = async (req, res) => {
  try {
    // Get the 5 most recent votes.
    const recentVotes = await connection.query(
      'SELECT TOP(5) candidate, time_cast FROM votes ORDER BY time_cast DESC'
    );

    const {NVarChar} = connection.TYPES;

    // Get votes
    const stmt =
      'SELECT COUNT(vote_id) as count FROM votes WHERE candidate=@candidate';
    const [tabsVotes] = await connection.query(stmt, [
      ['candidate', NVarChar, 'TABS'],
    ]);
    const [spacesVotes] = await connection.query(stmt, [
      ['candidate', NVarChar, 'SPACES'],
    ]);

    // failing: no recordset on undefined
    res.render('index.pug', {
      recentVotes: recentVotes || [],
      tabCount: tabsVotes.count.value,
      spaceCount: spacesVotes.count.value,
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
};

app.get('/', httpGet);

// Handle incoming vote requests and inserting them into the database.
const httpPost = async (req, res) => {
  const {team} = req.body;
  const timestamp = new Date();

  if (!team || (team !== 'TABS' && team !== 'SPACES')) {
    return res.status(400).send('Invalid team specified.').end();
  }

  try {
    const stmt =
      'INSERT INTO votes (time_cast, candidate) VALUES (@timestamp, @team)';
    const {DateTime, NVarChar} = connection.TYPES;
    // Runs query
    await connection.query(stmt, [
      ['timestamp', DateTime, timestamp],
      ['team', NVarChar, team],
    ]);
  } catch (err) {
    // If something goes wrong, handle the error in this section. This might
    // involve retrying or adjusting parameters depending on the situation.
    logger.error(err);
    return res
      .status(500)
      .send(
        'Unable to successfully cast vote! Please check the application logs for more details.'
      )
      .end();
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

module.exports.app = app;
