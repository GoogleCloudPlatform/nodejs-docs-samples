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
const { execSync } = require('child_process');

describe('System Tests', () => {

  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }

  const {CLOUD_SQL_CONNECTION_NAME} = process.env;
  if (!CLOUD_SQL_CONNECTION_NAME) {
    throw Error('"CLOUD_SQL_CONNECTION_NAME" env var not found.');
  }

  const {DB_PASSWORD} = process.env;
  if (!DB_PASSWORD) {
    throw Error('"DB_PASSWORD" env var not found.');
  }

  const {DB_NAME, DB_USER, SAMPLE_VERSION} = process.env;

  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    console.log('"SERVICE_NAME" env var not found. Defaulting to "idp-sql"');
    SERVICE_NAME = "idp-sql";
  }

  let BASE_URL, ID_TOKEN;

  before(() => {
    const buildCmd = `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      `--config ./test/e2e_test_setup.yaml ` +
      `--substitutions _SERVICE=${SERVICE_NAME},_DB_PASSWORD=${DB_PASSWORD}` +
      `,_CLOUD_SQL_CONNECTION_NAME=${CLOUD_SQL_CONNECTION_NAME}`;
    if(SAMPLE_VERSION) buildCmd + `,_VERSION=${SAMPLE_VERSION}`;
    if(DB_USER) buildCmd + `,_DB_USER=${DB_USER}`;
    if(DB_NAME) buildCmd + `,_DB_NAME=${DB_NAME}`;

    console.log('Starting Cloud Build...');
    execSync(buildCmd);
    console.log('Cloud Build completed.');

    const url = execSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
      `--platform=managed --region=us-central1 --format='value(status.url)'`);
    BASE_URL = url.toString('utf-8');
    if (!BASE_URL) throw Error('Cloud Run service URL not found');
    console.log('Cloud Run service URL found.');

    const idToken = execSync('gcloud auth print-identity-token');
    ID_TOKEN = idToken.toString('utf-8');
    if (!ID_TOKEN) throw Error('Unable to acquire an ID token.');
    console.log('ID token retrieved.');
  })

  after(() => {
    execSync(`gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      `--substitutions _SERVICE=${SERVICE_NAME} --config ./test/e2e_test_cleanup.yaml --quiet`);
  })

  it('Can successfully make a request', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      headers: {
        Authorization: `Bearer ${ID_TOKEN.trim()}`
      },
      retry: 3
    };
    const response = await got('', options);
    assert.strictEqual(response.statusCode, 200);
  });

  // These tests won't work when deploying test services that require IAM authentication
  it('Can not successfully make a POST request', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      method: 'POST',
      form: {team: 'DOGS'},
      headers: {
        Authorization: `Bearer ${ID_TOKEN.trim()}`
      },
      retry: 3
    };
    let err;
    try {
      const response = await got('', options);
    } catch (e) {
      err = e;
    }
    assert.strictEqual(err.response.statusCode, 403);
  });

});
