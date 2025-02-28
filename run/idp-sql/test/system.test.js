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

const assert = require('assert');
const got = require('got');
const admin = require('firebase-admin');
const {spawnSync, execSync} = require('child_process');

admin.initializeApp();

describe('System Tests', () => {
  // Retrieve Cloud Run service test config
  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }
  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    console.log('"SERVICE_NAME" env var not found. Defaulting to "idp-sql"');
    SERVICE_NAME = 'idp-sql';
  }

  const {SERVICE_ACCOUNT} = process.env;
  const {SAMPLE_VERSION} = process.env;
  const PLATFORM = 'managed';
  const REGION = 'us-central1';

  // Retrieve Cloud SQL test config
  const {CLOUD_SQL_CONNECTION_NAME} = process.env;
  if (!CLOUD_SQL_CONNECTION_NAME) {
    throw Error('"CLOUD_SQL_CONNECTION_NAME" env var not found.');
  }
  const {DB_PASSWORD} = process.env;
  if (!DB_PASSWORD) {
    throw Error('"DB_PASSWORD" env var not found.');
  }

  // Get Firebase Key to create Id Tokens
  const {IDP_KEY} = process.env;
  if (!IDP_KEY) {
    throw Error('"IDP_KEY" env var not found.');
  }

  let BASE_URL, CUSTOM_TOKEN;
  before(async () => {
    // Deploy service using Cloud Build
    let buildCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_setup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_REGION=${REGION}` +
      `,_DB_PASSWORD=${DB_PASSWORD},_CLOUD_SQL_CONNECTION_NAME=${CLOUD_SQL_CONNECTION_NAME}`;

    if (SERVICE_ACCOUNT) buildCmd += `,_SERVICE_ACCOUNT=${SERVICE_ACCOUNT}`;
    if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;

    console.log('Starting Cloud Build...');
    execSync(buildCmd, {timeout: 240000, shell: true}); // timeout at 4 mins
    console.log('Cloud Build completed.');

    // Retrieve URL of Cloud Run service
    const results = spawnSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
        `--platform=${PLATFORM} --region=${REGION} --format='value(status.url)'`,
      {shell: true}
    );

    const stdout = results.stdout && results.stdout.toString('utf-8').trim();
    const stderr = results.stderr && results.stderr.toString('utf-8').trim();

    BASE_URL = stdout.trim();
    if (!BASE_URL) {
      throw Error('Cloud Run service URL not found: ' + stderr);
    }

    // Retrieve ID token for testing
    const customToken = await admin.auth().createCustomToken('a-user-id');
    const response = await got(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${IDP_KEY}`,
      {
        method: 'POST',
        retry: {
          limit: 5,
          statusCodes: [404, 401, 403, 500],
          methods: ['POST'],
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      }
    );

    const tokens = JSON.parse(response.body);
    CUSTOM_TOKEN = tokens.idToken;
    if (!CUSTOM_TOKEN) throw Error('Unable to acquire an IDP token.');
  });

  after(() => {
    let cleanUpCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_cleanup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_REGION=${REGION}`;
    if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;
    if (SERVICE_ACCOUNT) cleanUpCmd += `,_SERVICE_ACCOUNT=${SERVICE_ACCOUNT}`;

    //TODO(glasnt): re-enable cleanup
    //execSync(cleanUpCmd, {shell: true});
  });

  it('Can successfully make a request', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      retry: {
        limit: 5,
        statusCodes: [404, 401, 403, 500],
        methods: ['GET', 'POST'],
      },
    };
    const response = await got('', options);
    assert.strictEqual(response.statusCode, 200);
  });

  it('Can make a POST request with token', async () => {
    assert(CUSTOM_TOKEN && CUSTOM_TOKEN.length > 0);

    const options = {
      prefixUrl: BASE_URL.trim(),
      method: 'POST',
      form: {team: 'DOGS'},
      headers: {
        Authorization: `Bearer ${CUSTOM_TOKEN.trim()}`,
      },
      retry: {
        limit: 5,
        statusCodes: [404, 401, 403, 500],
        methods: ['GET', 'POST'],
      },
    };

    let response = {};
    try {
      response = await got('', options);
    } catch (err) {
      assert.fail('POST request with token failed with error: ', err);
    }

    assert.strictEqual(response.statusCode, 200);
  });

  it('Can not make a POST request with bad token', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      method: 'POST',
      form: {team: 'DOGS'},
      headers: {
        Authorization: 'Bearer iam-a-token',
      },
      retry: {
        limit: 5,
        statusCodes: [404, 401, 500],
        methods: ['GET', 'POST'],
      },
    };
    let err;
    try {
      await got('', options);
    } catch (e) {
      err = e;
    }
    assert.strictEqual(err.response.statusCode, 403);
  });

  it('Can not make a POST request with no token', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      method: 'POST',
      form: {team: 'DOGS'},
      retry: {
        limit: 5,
        statusCodes: [404, 401, 403, 500],
        methods: ['GET', 'POST'],
      },
    };
    let err;
    try {
      await got('', options);
    } catch (e) {
      err = e;
    }
    assert.strictEqual(err.response.statusCode, 401);
  });
});
