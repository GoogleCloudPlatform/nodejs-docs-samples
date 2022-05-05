// Copyright 2019 Google LLC
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

const assert = require('assert');
const got = require('got');
const {execSync} = require('child_process');
const {GoogleAuth} = require('google-auth-library');
const auth = new GoogleAuth();

const request = (method, route, base_url, id_token) => {
  return got(new URL(route, base_url.trim()), {
    headers: {
      Authorization: id_token.trim(),
    },
    method: method || 'get',
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
    SERVICE_NAME = 'system-package';
    console.log(
      `"SERVICE_NAME" env var not found. Defaulting to "${SERVICE_NAME}"`
    );
  }
  const {SAMPLE_VERSION} = process.env;
  const PLATFORM = 'managed';
  const REGION = 'us-central1';

  let BASE_URL, ID_TOKEN;
  before(async () => {
    // Deploy service using Cloud Build
    let buildCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_setup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;

    console.log('Starting Cloud Build...');
    execSync(buildCmd, {timeout: 240000}); // timeout at 4 mins
    console.log('Cloud Build completed.');

    // Retrieve URL of Cloud Run service
    const url = execSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
        `--platform=${PLATFORM} --region=${REGION} --format='value(status.url)'`
    );

    BASE_URL = url.toString('utf-8').trim();
    if (!BASE_URL) throw Error('Cloud Run service URL not found');

    // Retrieve ID token for testing
    const client = await auth.getIdTokenClient(BASE_URL);
    const clientHeaders = await client.getRequestHeaders();
    ID_TOKEN = clientHeaders['Authorization'].trim();
    if (!ID_TOKEN) throw Error('Unable to acquire an ID token.');
  });

  after(() => {
    let cleanUpCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_cleanup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;

    execSync(cleanUpCmd);
  });

  it('post(/diagram.png) without request parameters is a bad request', async () => {
    const response = await request('get', '/diagram.png', BASE_URL, ID_TOKEN);
    assert.strictEqual(
      response.statusCode,
      400,
      'Bad Requests status not found'
    );
  });

  it('post(/diagram.png) with request parameters is a successful', async () => {
    const response = await request(
      'get',
      '/diagram.png?dot=digraph Run { rankdir=LR Code -> Build -> Deploy -> Run }',
      BASE_URL,
      ID_TOKEN
    );
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.headers['content-type'], 'image/png');
  });
});
