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

// [START run_user_auth_sql_connect]
const connectWithUnixSockets = (secretConfig) => {
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
    // See Cloud SQL sample https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/cloud-sql/postgres/knex
    // to learn more about this configuration
    pool: {
      max: 5,
      min: 5,
      acquireTimeoutMillis: 60000,
    },
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
    createRetryIntervalMillis: 200,
  });
}
// [END run_user_auth_sql_connect]

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
  if (!knex) knex = connectWithUnixSockets(await secrets);
  return await knex('votes').insert(vote);
};

/**
 * Retrieve the latest 5 vote records from the database.
 *
 * @param {object} knex The Knex connection object.
 * @returns {Promise}
 */
const getVotes = async () => {
  if (!knex) knex = connectWithUnixSockets(await secrets);
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
  if (!knex) knex = connectWithUnixSockets(await secrets);
  return await knex('votes').count('vote_id').where('candidate', candidate);
};

module.exports = {
  getVoteCount,
  getVotes,
  insertVote,
}
