/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = `node jobs.js`;
const badJobName = `projects/not-a-project/dlpJobs/i-123456789`;

const testCallingProjectId = process.env.GCLOUD_PROJECT;
const testTableProjectId = `bigquery-public-data`;
const testDatasetId = `san_francisco`;
const testTableId = `bikeshare_trips`;
const testColumnName = `zip_code`;

// Helper function for creating test jobs
const createTestJob = async () => {
  // Initialize client library
  const DLP = require('@google-cloud/dlp').v2;
  const dlp = new DLP.DlpServiceClient();

  // Construct job request
  const request = {
    parent: dlp.projectPath(testCallingProjectId),
    riskJob: {
      privacyMetric: {
        categoricalStatsConfig: {
          field: {
            name: testColumnName,
          },
        },
      },
      sourceTable: {
        projectId: testTableProjectId,
        datasetId: testDatasetId,
        tableId: testTableId,
      },
    },
  };

  // Create job
  return dlp.createDlpJob(request).then(response => {
    return response[0].name;
  });
};

// Create a test job
let testJobName;
before(async () => {
  tools.checkCredentials();
  testJobName = await createTestJob();
});

// dlp_list_jobs
it('should list jobs', async () => {
  const output = await tools.runAsync(`${cmd} list 'state=DONE'`);
  assert.strictEqual(
    new RegExp(/Job projects\/(\w|-)+\/dlpJobs\/\w-\d+ status: DONE/).test(
      output
    ),
    true
  );
});

it('should list jobs of a given type', async () => {
  const output = await tools.runAsync(
    `${cmd} list 'state=DONE' -t RISK_ANALYSIS_JOB`
  );
  assert.strictEqual(
    new RegExp(/Job projects\/(\w|-)+\/dlpJobs\/r-\d+ status: DONE/).test(
      output
    ),
    true
  );
});

it('should handle job listing errors', async () => {
  const output = await tools.runAsync(`${cmd} list 'state=NOPE'`);
  assert.strictEqual(new RegExp(/Error in listJobs/).test(output), true);
});

// dlp_delete_job
it('should delete job', async () => {
  const output = await tools.runAsync(`${cmd} delete ${testJobName}`);
  assert.strictEqual(output, `Successfully deleted job ${testJobName}.`);
});

it('should handle job deletion errors', async () => {
  const output = await tools.runAsync(`${cmd} delete ${badJobName}`);
  assert.strictEqual(new RegExp(/Error in deleteJob/).test(output), true);
});
