// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import assert from 'assert';
import {execSync} from 'child_process';
import request from 'got';

const get = (route, base_url, id_token) => {
  return request(new URL(route, base_url.trim()), {
    headers: {
      Authorization: `Bearer ${id_token}`,
    },
    throwHttpErrors: false,
  });
};

describe('End-to-End Tests', () => {
  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }
  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    SERVICE_NAME = 'helloworld';
    console.log(
      `"SERVICE_NAME" env var not found. Defaulting to "${SERVICE_NAME}"`
    );
  }
  const {SERVICE_ACCOUNT} = process.env;
  let {NAME} = process.env;
  if (!NAME) {
    NAME = 'Cloud';
    console.log(`"NAME" env var not found. Defaulting to "${NAME}"`);
  }
  const {SAMPLE_VERSION} = process.env;

  // ID Token is made available via the test runner.
  // Otherwise, use auth.getIdTokenClient(BASE_URL);
  const {ID_TOKEN} = process.env;
  if (!ID_TOKEN) {
    throw Error('"ID_TOKEN" env var not found.');
  }

  const PLATFORM = 'managed';
  const REGION = 'us-central1';
  before(async () => {
    // Deploy service using Cloud Build
    let buildCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_setup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}` +
      `,_NAME=${NAME}`;
    if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;
    if (SERVICE_ACCOUNT) buildCmd += `,_SERVICE_ACCOUNT=${SERVICE_ACCOUNT}`;

    console.log('Starting Cloud Build...');
    execSync(buildCmd, {timeout: 240000}); // timeout at 4 mins
    console.log('Cloud Build completed.');
  });

  after(() => {
    let cleanUpCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_cleanup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;
    if (SERVICE_ACCOUNT) cleanUpCmd += `,_SERVICE_ACCOUNT=${SERVICE_ACCOUNT}`;

    execSync(cleanUpCmd);
  });

  it('Service uses the NAME override', async () => {
    // Retrieve URL of Cloud Run service
    const url = execSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
        `--platform=${PLATFORM} --region=${REGION} --format='value(status.url)'`
    );

    const BASE_URL = url.toString('utf-8').trim();
    if (!BASE_URL) throw Error('Cloud Run service URL not found');

    const response = await get('/', BASE_URL, ID_TOKEN);
    assert.strictEqual(
      response.statusCode,
      200,
      'Did not fallback to default as expected'
    );
    assert.strictEqual(
      response.body,
      `Hello ${NAME}!`,
      `Expected override "${NAME}" not found`
    );
  });
});
