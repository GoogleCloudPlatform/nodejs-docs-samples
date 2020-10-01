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

const { logger } = require('./logging');

// SECRETS is the resource ID of the secret, passed in by environment variable.
// Format: projects/PROJECT_ID/secrets/SECRET_ID/versions/VERSION
const {SECRETS} = process.env;

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

let client;

// Load the secret from Secret Manager
async function getSecretConfig() {
  if (SECRETS) {
    // [START run_user_auth_secrets]
    if (!client) client = new SecretManagerServiceClient();
    try {
      const [version] = await client.accessSecretVersion({name: SECRETS});
      // Parse the secret that has been added as a JSON string
      // to retreive database credentials
      const secrets = JSON.parse(version.payload.data.toString('utf8'));
      return secrets;
    }
    catch (err) {
      logger.error(`error: could not retrieve secret: ${err}`);
      return
    }
    // [END run_user_auth_secrets]
  } else {
    logger.info('SECRETS env var not set. Defaulting to environment variables.');
    if (!process.env.DB_USER) throw Error('DB_USER needs to be set.');
    if (!process.env.DB_PASS) throw Error('DB_PASS needs to be set.');
    if (!process.env.DB_NAME) throw Error('DB_NAME needs to be set.');
    if (!process.env.CLOUD_SQL_CONNECTION_NAME) throw Error('connection name needs to be set.');

    return {
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS,
      DB_NAME: process.env.DB_NAME,
      CLOUD_SQL_CONNECTION_NAME: process.env.CLOUD_SQL_CONNECTION_NAME
    }
  }
}

module.exports = {
  getSecretConfig
}
