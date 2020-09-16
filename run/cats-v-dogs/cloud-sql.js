// Copyright 2018 Google LLC
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

// [START run_user_auth_knex]
const connectWithUnixSockets = (config, secretConfig) => {
  const dbSocketPath = process.env.DB_SOCKET_PATH || "/cloudsql"
  // Establish a connection to the database
  return Knex({
    client: 'pg',
    connection: {
      user: secretConfig.DB_USER, // e.g. 'my-user'
      password: secretConfig.DB_PASS, // e.g. 'my-user-password'
      database: secretConfig.DB_NAME, // e.g. 'my-database'
      host: `${dbSocketPath}/${secretConfig.CLOUD_SQL_CONNECTION_NAME}`,
    },
    // ... Specify additional properties here.
    ...config
  });
}
// [END run_user_auth_knex]

const config = {
  // Configure which instance and what database user to connect with.
  // Remember - storing secrets in plaintext is potentially unsafe. Consider using
  // something like https://cloud.google.com/kms/ to help keep secrets secret.
  pool: {
    // 'max' limits the total number of concurrent connections this pool will keep. Ideal
    // values for this setting are highly variable on app design, infrastructure, and database.
    max: 5,
    // 'min' is the minimum number of idle connections Knex maintains in the pool.
    // Additional connections will be established to meet this value unless the pool is full.
    min: 5,
    // 'acquireTimeoutMillis' is the number of milliseconds before a timeout occurs when acquiring a
    // connection from the pool. This is slightly different from connectionTimeout, because acquiring
    // a pool connection does not always involve making a new connection, and may include multiple retries.
    // when making a connection
    acquireTimeoutMillis: 60000, // 60 seconds
  },
  // 'createTimeoutMillis` is the maximum number of milliseconds to wait trying to establish an
  // initial connection before retrying.
  // After acquireTimeoutMillis has passed, a timeout exception will be thrown.
  createTimeoutMillis: 30000, // 30 seconds
  // 'idleTimeoutMillis' is the number of milliseconds a connection must sit idle in the pool
  // and not be checked out before it is automatically closed.
  idleTimeoutMillis: 600000, // 10 minutes
  // 'knex' uses a built-in retry strategy which does not implement backoff.
  // 'createRetryIntervalMillis' is how long to idle after failed connection creation before trying again
  createRetryIntervalMillis: 200, // 0.2 seconds
};

let knex;
let secrets = getSecretConfig();

/**
 * Insert a vote record into the database.
 *
 * @param {object} knex The Knex connection object.
 * @param {object} vote The vote record to insert.
 * @returns {Promise}
 */
const insertVote = async (vote) => {
  if (!knex) knex = connectWithUnixSockets(config, await secrets);
  return await knex('votes').insert(vote);
};

/**
 * Retrieve the latest 5 vote records from the database.
 *
 * @param {object} knex The Knex connection object.
 * @returns {Promise}
 */
const getVotes = async () => {
  if (!knex) knex = connectWithUnixSockets(config, await secrets);
  return await knex
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
  if (!knex) knex = connectWithUnixSockets(config, await secrets);
  return await knex('votes').count('vote_id').where('candidate', candidate);
};

module.exports = {
  getVoteCount,
  getVotes,
  insertVote,
}
