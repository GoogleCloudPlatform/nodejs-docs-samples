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
const request = require('got');
const {Logging} = require('@google-cloud/logging');
const {execSync} = require('child_process');
const {GoogleAuth} = require('google-auth-library');
const auth = new GoogleAuth();

const {promisify} = require('util');
const setTimeoutPromise = promisify(setTimeout);

// Support concurrency by setting the service name to something unique.
// The service name must be the same used to deploy to Cloud Run.
const service_name = process.env.SERVICE_NAME || require('../package').name;

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const getLogEntriesPolling = async (filter, max_attempts) => {
  const WRITE_CONSISTENCY_DELAY_MS = 10000;
  const MAX_ATTEMPTS = max_attempts || 10;
  let entries;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await setTimeoutPromise(WRITE_CONSISTENCY_DELAY_MS * i);
    entries = await getLogEntries(filter);
    if (entries[0] && entries[0].length > 0) {
      return entries[0];
    }
  }

  return [];
};

const getLogEntries = async filter => {
  const preparedFilter = `resource.type="cloud_run_revision" severity!="default" ${filter}  NOT protoPayload.serviceName="run.googleapis.com"`;
  const entries = await logging.getEntries({
    filter: preparedFilter,
    autoPaginate: false,
    pageSize: 2,
  });

  return entries;
};

const dateMinutesAgo = (date, min_ago) => {
  date.setMinutes(date.getMinutes() - min_ago);
  return date.toISOString();
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Logging', () => {
  let requestLog;
  let sampleLog;

  describe('Live Service', () => {
    const {GOOGLE_CLOUD_PROJECT} = process.env;
    if (!GOOGLE_CLOUD_PROJECT) {
      throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
    }
    let {SERVICE_NAME} = process.env;
    if (!SERVICE_NAME) {
      SERVICE_NAME = 'logging-manual';
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

    it('can be reached by an HTTP request', async () => {
      if (!BASE_URL) {
        throw Error(
          '"BASE_URL" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
        );
      }

      if (!ID_TOKEN) {
        throw Error('"ID_TOKEN" environment variable is required.');
      }

      console.log(`Sending test requests to ${BASE_URL}`);
      await request(BASE_URL.trim(), {
        headers: {
          Authorization: `${ID_TOKEN.trim()}`,
        },
      });
    });

    it('generates Stackdriver logs', async () => {
      // The latest two log entries for our service in the last 5 minutes
      // are treated as the result of the previous test.
      // Concurrency is supporting by distinctly named service deployment per test run.
      let entries;
      let attempt = 0;
      const maxAttempts = 5;
      while ((!requestLog || !sampleLog) && attempt < maxAttempts) {
        await sleep(attempt * 30000); // Linear backoff between retry attempts
        // Filter by service name over the last 5 minutes
        const filter = `resource.labels.service_name="${service_name}" timestamp>="${dateMinutesAgo(
          new Date(),
          5
        )}"`;
        entries = await getLogEntriesPolling(filter);
        entries.forEach(entry => {
          if (entry.metadata.httpRequest) {
            requestLog = entry;
          } else {
            sampleLog = entry;
          }
        });
        attempt += 1;
      }

      assert(entries.length >= 2, 'creates at least 2 log entries per request');
    });
  });

  describe('Structured Logging', () => {
    it('retains "message" property for display text', () => {
      assert(sampleLog.data.message, 'property found in the log entry');
    });

    it('retains structure for arbitrary properties', () => {
      assert(sampleLog.data.component, 'property found in the log entry');
    });

    it('uses "severity" property as entry severity', () => {
      assert(
        sampleLog.metadata.severity,
        "'severity' lifted to official property"
      );
    });
  });

  describe('Log Correlation', () => {
    it('uses "trace" property as entry trace', () => {
      assert(sampleLog.metadata.trace, "'trace' lifted to official property");
    });
    it('uses a correlated trace ID with the request log', () => {
      assert(
        sampleLog.metadata.trace === requestLog.metadata.trace,
        '`trace` property matches request log trace ID'
      );
    });
  });

  describe('Cloud Run Log Metadata', () => {
    it('has expected label properties', () => {
      const {labels, resource} = sampleLog.metadata;

      assert(labels.instanceId, "'labels.instanceId' found in the log entry");
      assert(
        resource.labels.configuration_name,
        "'resource.labels.configuration_name' found in the log entry"
      );
      assert(
        resource.labels.location,
        "'resource.labels.location' found in the log entry"
      );
      assert(
        resource.labels.project_id,
        "'resource.labels.project_id' found in the log entry"
      );
      assert(
        resource.labels.revision_name,
        "'resource.labels.revision_name' found in the log entry"
      );
      assert(
        resource.labels.service_name,
        "'resource.labels.service_name' found in the log entry"
      );
    });
  });
});
