// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

const assert = require('assert');
const {Logging} = require('@google-cloud/logging');
const request = require('got');

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
  const MAX_ATTEMPTS = max_attempts || 8;
  let entries;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await setTimeoutPromise(WRITE_CONSISTENCY_DELAY_MS);
    entries = await getLogEntries(filter);
    if (entries[0] && entries[0].length > 0) {
      return entries[0];
    }
  }

  return [];
};

const getLogEntries = async (filter) => {
  const preparedFilter = `resource.type="cloud_run_revision" ${filter}`;
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

describe('Logging', () => {
  let requestLog;
  let sampleLog;

  describe('Live Service', () => {
    it('can be reached by an HTTP request', async () => {
      const {BASE_URL, ID_TOKEN} = process.env;
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
          Authorization: `Bearer ${ID_TOKEN.trim()}`,
        },
      });
    });

    it('generates Stackdriver logs', async () => {
      // The latest two log entries for our service in the last 5 minutes
      // are treated as the result of the previous test.
      // Concurrency is supporting by distinctly named service deployment per test run.
      const filter = `resource.labels.service_name="${service_name}" timestamp>="${dateMinutesAgo(
        new Date(),
        5
      )}"`;
      const entries = await getLogEntriesPolling(filter);
      entries.forEach((entry) => {
        if (entry.metadata.httpRequest) {
          requestLog = entry;
        } else {
          sampleLog = entry;
        }
      });
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
