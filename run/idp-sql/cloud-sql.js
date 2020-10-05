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
const { getSecretConfig } = require('./secrets');

// Connection pooling config
// See Cloud SQL sample https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/cloud-sql/postgres/knex
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
}

// [START run_user_auth_sql_connect]
const connectWithUnixSockets = async (credConfig) => {
  const dbSocketPath = process.env.DB_SOCKET_PATH || "/cloudsql"
  // Establish a connection to the database
  return Knex({
    client: 'pg',
    connection: {
      user: credConfig.DB_USER, // e.g. 'my-user'
      password: credConfig.DB_PASS, // e.g. 'my-user-password'
      database: credConfig.DB_NAME, // e.g. 'my-database'
      host: `${dbSocketPath}/${credConfig.CLOUD_SQL_CONNECTION_NAME}`,
    },
    ...config
  });
}
// [END run_user_auth_sql_connect]

// Method to connect locally on Windows
const connectWithTcp = (credConfig) => {
  // Extract host and port from socket address
  const dbSocketAddr = process.env.DB_HOST.split(":") // e.g. '127.0.0.1:5432'
  // Establish a connection to the database
  return Knex({
    client: 'pg',
    connection: {
      user: credConfig.DB_USER, // e.g. 'my-user'
      password: credConfig.DB_PASS, // e.g. 'my-user-password'
      database: credConfig.DB_NAME, // e.g. 'my-database'
      host: dbSocketAddr[0], // e.g. '127.0.0.1'
      port: dbSocketAddr[1], // e.g. '5432'
    },
    ...config
  });
}

let knex, credConfig;
const connect = async () => {
  if (!credConfig) credConfig = await getSecretConfig();
  if (process.env.DB_HOST) {
    knex = connectWithTcp(credConfig);
  } else {
    knex = connectWithUnixSockets(credConfig);
  }
  return knex;
}

/**
* Insert a vote record into the database.
*
* @param {object} knex The Knex connection object.
* @param {object} vote The vote record to insert.
* @returns {Promise}
*/
const insertVote = async (vote) => {
  if (!knex) knex = await connect();
  return knex('votes').insert(vote);
};

/**
* Retrieve the latest 5 vote records from the database.
*
* @param {object} knex The Knex connection object.
* @returns {Promise}
*/
const getVotes = async () => {
  if (!knex) knex = await connect();
  return knex
  .select('candidate', 'time_cast', 'uid')
  .from('votes')
  .orderBy('time_cast', 'desc')
  .limit(5);
};

/**
* Retrieve the total count of records for a given candidate
* from the database.
*
* @param {object} knex The Knex connection object.
* @param {object} candidate The candidate for which to get the total vote count
* @returns {Promise}
*/
const getVoteCount = async (candidate) => {
  if (!knex) knex = await connect();
  return knex('votes').count('vote_id').where('candidate', candidate);
};

module.exports = {
  getVoteCount,
  getVotes,
  insertVote,
}
