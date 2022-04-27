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

const assert = require('assert');
const got = require('got');
const {execSync} = require('child_process');
const {GoogleAuth} = require('google-auth-library');
const auth = new GoogleAuth();

describe('End-to-End Tests', () => {
  // Retrieve Cloud Run service test config
  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }
  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    console.log('"SERVICE_NAME" env var not found. Defaulting to "editor"');
    SERVICE_NAME = 'editor';
  }
  const {SAMPLE_VERSION} = process.env;
  const PLATFORM = 'managed';
  const REGION = 'us-central1';

  let BASE_URL, ID_TOKEN;
  before(async () => {
    // Deploy Renderer service
    let buildRendererCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ../renderer/test/e2e_test_setup.yaml ' +
      `--substitutions _SERVICE=renderer-${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) buildRendererCmd += `,_VERSION=${SAMPLE_VERSION}`;

    console.log('Starting Cloud Build for Renderer service...');
    execSync(buildRendererCmd, {cwd: '../renderer'});
    console.log('Cloud Build completed.\n');

    // Deploy Editor service using Cloud Build
    let buildCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_setup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;

    console.log('Starting Cloud Build for Editor service...');
    execSync(buildCmd, {timeout: 240000}); // timeout at 4 mins
    console.log('Cloud Build completed.\n');

    // Retrieve URL of Cloud Run service
    const url = execSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
        `--platform=${PLATFORM} --region=${REGION} --format='value(status.url)'`
    );
    BASE_URL = url.toString('utf-8').trim();
    if (!BASE_URL) throw Error('Cloud Run service URL not found');

    const client = await auth.getIdTokenClient(BASE_URL);
    const clientHeaders = await client.getRequestHeaders();
    ID_TOKEN = clientHeaders['Authorization'];
    if (!ID_TOKEN) throw Error('ID token could not be created');
  });

  after(() => {
    let cleanUpCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_cleanup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;

    execSync(cleanUpCmd);
  });

  it('Can successfully make a request', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      headers: {
        Authorization: ID_TOKEN.trim(),
      },
      retry: 3,
    };
    const response = await got('', options);
    assert.strictEqual(response.statusCode, 200);
  });

  it('Can successfully make a request to the Renderer', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      headers: {
        Authorization: ID_TOKEN.trim(),
        'Content-Type': 'application/json',
      },
      method: 'POST',
      json: {
        data: '**markdown**',
      },
      retry: {
        limit: 5,
        methods: ['POST'],
      },
    };
    const response = await got('render', options);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, '<p><strong>markdown</strong></p>\n');
  });
});
