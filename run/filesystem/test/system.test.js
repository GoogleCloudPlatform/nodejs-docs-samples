// Copyright 2023 Google LLC
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
const request = require('got');
const {execSync} = require('child_process');

const get = (route, base_url, id_token, retry = 3) => {
  return request(new URL(route, base_url.trim()), {
    headers: {
      Authorization: `Bearer ${id_token.trim()}`,
    },
    throwHttpErrors: false,
    retry,
  });
};

const appendRandomSuffix = string =>
  // Append a random 6-digit number to a provided string. Use to create unique
  // service name.
  `${string}-${Math.random().toString().substring(2, 8)}`;

describe('End-to-End Tests', () => {
  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }
  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    SERVICE_NAME = appendRandomSuffix('filesystem-app');
    console.log(
      `"SERVICE_NAME" env var not found. Defaulting to "${appendRandomSuffix(
        'filesystem-app'
      )}"`
    );
  }
  const {SAMPLE_VERSION} = process.env;
  const REGION = 'us-central1';
  describe('Service relying on defaults', () => {
    let BASE_URL, ID_TOKEN;
    before(async () => {
      let buildCmd =
        `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
        '--config ./test/e2e_test_setup.yaml ' +
        ` --substitutions _FILESTORE_IP_ADDRESS=10.42.154.2,_RUN_SERVICE=${SERVICE_NAME},_REGION=${REGION}`;
      if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;

      console.log('Starting Cloud Build...');
      execSync(buildCmd, {timeout: 240000}); // timeout at 4 mins
      console.log('Cloud Build completed.');

      // Retrieve URL of Cloud Run service
      const url = execSync(
        `gcloud run services describe ${SERVICE_NAME} --project ${GOOGLE_CLOUD_PROJECT} ` +
          `--region=${REGION} --format='value(status.url)'`
      );

      BASE_URL = url.toString('utf-8').trim();
      if (!BASE_URL) throw Error('Cloud Run service URL not found');
      // Retrieve ID token for testing
      ID_TOKEN = execSync('gcloud auth print-identity-token').toString();
      if (!ID_TOKEN) throw Error('Unable to acquire an ID token.');
    });

    after(() => {
      let cleanUpCmd =
        `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
        '--config ./test/e2e_test_cleanup.yaml ' +
        `--substitutions _RUN_SERVICE=${SERVICE_NAME},_REGION=${REGION};`;
      if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;

      execSync(cleanUpCmd);
    });

    it('GET endpoint URL redirects to mount point path', async () => {
      const response = await get('/', BASE_URL, ID_TOKEN, 0);
      assert.strictEqual(response.url, `${BASE_URL}/mnt/nfs/filestore/`);
    });

    it('GET non-existant path redirects to mount point path', async () => {
      const response = await get('/doesnotexist', BASE_URL, ID_TOKEN, 0);
      assert.strictEqual(response.url, `${BASE_URL}/mnt/nfs/filestore/`);
    });

    it('GET mount point path responds with 200', async () => {
      const response = await get('/mnt/nfs/filestore/', BASE_URL, ID_TOKEN, 0);
      assert.strictEqual(response.statusCode, 200);
    });

    it('GET generated txt file responds with txt file', async () => {
      const getMntPathPage = await get(
        '/mnt/nfs/filestore/',
        BASE_URL,
        ID_TOKEN,
        0
      );
      const bodyElements = getMntPathPage.body.split('<br> ');
      const latestFile = bodyElements[bodyElements.length - 1].replace(
        /(<([^>]+)>)/gi,
        ''
      );
      const response = await get(
        `/mnt/nfs/filestore/${latestFile}`,
        BASE_URL,
        ID_TOKEN,
        0
      );
      assert.match(response.body, /This test file was created on/);
    });
  });
});
