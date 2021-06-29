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

const {logger} = require('./logging');

// Load the Cloud SQL config from Secret Manager
function getCredConfig() {
  // [START cloudrun_user_auth_secrets]
  // [START run_user_auth_secrets]
  // CLOUD_SQL_CREDENTIALS_SECRET is the resource ID of the secret, passed in by environment variable.
  // Format: projects/PROJECT_ID/secrets/SECRET_ID/versions/VERSION
  const {CLOUD_SQL_CREDENTIALS_SECRET} = process.env;
  if (CLOUD_SQL_CREDENTIALS_SECRET) {
    try {
      // Parse the secret that has been added as a JSON string
      // to retrieve database credentials
      return JSON.parse(CLOUD_SQL_CREDENTIALS_SECRET.toString('utf8'));
    } catch (err) {
      throw Error(
        `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: ${err}`
      );
    }
  }
  // [END run_user_auth_secrets]
  // [END cloudrun_user_auth_secrets]
  logger.info(
    'CLOUD_SQL_CREDENTIALS_SECRET env var not set. Defaulting to environment variables.'
  );
  if (!process.env.DB_USER) throw Error('DB_USER needs to be set.');
  if (!process.env.DB_PASSWORD) throw Error('DB_PASSWORD needs to be set.');
  if (!process.env.DB_NAME) throw Error('DB_NAME needs to be set.');
  if (!process.env.CLOUD_SQL_CONNECTION_NAME)
    throw Error('CLOUD_SQL_CONNECTION_NAME needs to be set.');

  return {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    CLOUD_SQL_CONNECTION_NAME: process.env.CLOUD_SQL_CONNECTION_NAME,
  };
}

module.exports = {
  getCredConfig,
};
