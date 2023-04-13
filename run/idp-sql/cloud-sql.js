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

const Knex = require('knex');
const {getCredConfig} = require('./secrets');
const {logger} = require('./logging');

const TABLE = process.env.TABLE || 'pet_votes';
let knex, credConfig;

// Connection pooling config
// See Cloud SQL sample https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/cloud-sql/postgres/knex
// to learn more about this configuration
const config = {
  pool: {
    max: 5,
    min: 5,
    acquireTimeoutMillis: 60000,
  },
  createTimeoutMillis: 30000,
  idleTimeoutMillis: 600000,
  createRetryIntervalMillis: 200,
};

// [START cloudrun_user_auth_sql_connect]
// [START run_user_auth_sql_connect]
/**
 * Connect to the Cloud SQL instance through UNIX Sockets
 *
 * @param {object} credConfig The Cloud SQL connection configuration from Secret Manager
 * @returns {object} Knex's PostgreSQL client
 */
const connectWithUnixSockets = async credConfig => {
  const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
  // Establish a connection to the database
  return Knex({
    client: 'pg',
    connection: {
      user: credConfig.DB_USER, // e.g. 'my-user'
      password: credConfig.DB_PASSWORD, // e.g. 'my-user-password'
      database: credConfig.DB_NAME, // e.g. 'my-database'
      host: `${dbSocketPath}/${credConfig.CLOUD_SQL_CONNECTION_NAME}`,
    },
    ...config,
  });
};
// [END run_user_auth_sql_connect]
// [END cloudrun_user_auth_sql_connect]

// Method to connect locally on Windows
const connectWithTcp = credConfig => {
  // Extract host and port from socket address
  const dbSocketAddr = process.env.DB_HOST.split(':'); // e.g. '127.0.0.1:5432'
  // Establish a connection to the database
  return Knex({
    client: 'pg',
    connection: {
      user: credConfig.DB_USER, // e.g. 'my-user'
      password: credConfig.DB_PASSWORD, // e.g. 'my-user-password'
      database: credConfig.DB_NAME, // e.g. 'my-database'
      host: dbSocketAddr[0], // e.g. '127.0.0.1'
      port: dbSocketAddr[1], // e.g. '5432'
    },
    ...config,
  });
};

/**
 * Connect to the Cloud SQL instance through TCP or UNIX Sockets
 * dependent on DB_HOST env var
 *
 * @returns {object} Knex's PostgreSQL client
 */
const connect = async () => {
  if (!credConfig) credConfig = getCredConfig();
  if (process.env.DB_HOST) {
    return connectWithTcp(credConfig);
  } else {
    return connectWithUnixSockets(credConfig);
  }
};

/**
 * Insert a vote record into the database.
 *
 * @param {object} vote The vote record to insert.
 * @returns {Promise}
 */
const insertVote = async vote => {
  if (!knex) knex = await connect();
  return knex(TABLE).insert(vote);
};

/**
 * Retrieve the latest 5 vote records from the database.
 *
 * @returns {Promise}
 */
const getVotes = async () => {
  if (!knex) knex = await connect();
  return knex
    .select('candidate', 'time_cast', 'uid')
    .from(TABLE)
    .orderBy('time_cast', 'desc')
    .limit(5);
};

/**
 * Retrieve the total count of records for a given candidate
 * from the database.
 *
 * @param {object} candidate The candidate for which to get the total vote count
 * @returns {Promise}
 */
const getVoteCount = async candidate => {
  if (!knex) knex = await connect();
  return knex(TABLE).count('vote_id').where('candidate', candidate);
};

/**
 * Create "votes" table in the Cloud SQL database
 */
const createTable = async () => {
  if (!knex) knex = await connect();
  const exists = await knex.schema.hasTable(TABLE);
  if (!exists) {
    try {
      await knex.schema.createTable(TABLE, table => {
        table.bigIncrements('vote_id').notNull();
        table.timestamp('time_cast').notNull();
        table.specificType('candidate', 'CHAR(6) NOT NULL');
        table.specificType('uid', 'VARCHAR(128) NOT NULL');
      });
      logger.info(`Successfully created ${TABLE} table.`);
    } catch (err) {
      const message = `Failed to create ${TABLE} table: ${err}`;
      logger.error(message);
    }
  }
};

const closeConnection = () => {
  if (!knex) knex.destroy();
  logger.info('DB connection closed.');
};

module.exports = {
  getVoteCount,
  getVotes,
  insertVote,
  createTable,
  closeConnection,
};
