// Copyright 2022 Google LLC
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
const {execSync} = require('child_process');
const {Logging} = require('@google-cloud/logging');

const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('End-to-End Tests', () => {
  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }
  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    SERVICE_NAME = 'logger-job';
    console.log(
      `"SERVICE_NAME" env var not found. Defaulting to "${SERVICE_NAME}"`
    );
  }
  const {SAMPLE_VERSION} = process.env;
  const REGION = 'us-west1';
  before(async () => {
    // Deploy service using Cloud Build
    let buildCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_setup.yaml --timeout="15m" ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_REGION=${REGION}`;
    if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;

    console.log('Starting Cloud Build...');
    execSync(buildCmd, {stdio: 'inherit'});
    console.log('Cloud Build completed.');
  });

  after(() => {
    let cleanUpCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_cleanup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_REGION=${REGION}`;
    if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;

    execSync(cleanUpCmd);
  });

  const dateMinutesAgo = (date, min_ago) => {
    date.setMinutes(date.getMinutes() - min_ago);
    return date.toISOString();
  };

  it('generates logs in Cloud Logging', async () => {
    const logging = new Logging({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });

    const preparedFilter =
      'resource.type = "cloud_run_job" ' +
      `resource.labels.job_name = "${SERVICE_NAME}" ` +
      `resource.labels.location = "${REGION}" ` +
      `timestamp>="${dateMinutesAgo(new Date(), 5)}"`;
    console.log(preparedFilter);

    await sleep(120000); // Wait for 2 minutes for logs to be ingested by Cloud Logging

    let found = false;
    for (let i = 1; i <= 10; i++) {
      const entries = await logging.getEntries({
        filter: preparedFilter,
        autoPaginate: false,
        pageSize: 3,
      });

      if (entries[0] && entries[0].length > 0) {
        found = entries[0].find(entry => {
          return typeof entry.data === 'string'
            ? entry.data.includes('Task')
            : false;
        });
      }
      if (found) {
        break;
      }
      await sleep(i * 5000);
    }
    assert(found);
  });
});
