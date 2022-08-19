// Copyright 2018 Google LLC
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

const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const cp = require('child_process');
const DLP = require('@google-cloud/dlp');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const badJobName = 'projects/not-a-project/dlpJobs/i-123456789';

const testTableProjectId = 'bigquery-public-data';
const testDatasetId = 'san_francisco';
const testTableId = 'bikeshare_trips';
const testColumnName = 'zip_code';

const client = new DLP.DlpServiceClient();

// createTestJob needs time to finish creating a DLP job, before listing
// tests will succeed.
const delay = async test => {
  const retries = test.currentRetry();
  if (retries === 0) return; // no retry on the first failure.
  // see: https://cloud.google.com/storage/docs/exponential-backoff:
  const ms = Math.pow(2, retries) * 1000 + Math.random() * 2000;
  return new Promise(done => {
    console.info(`retrying "${test.title}" in ${ms}ms`);
    setTimeout(done, ms);
  });
};

describe('test', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });
  // Helper function for creating test jobs
  const createTestJob = async () => {
    // Initialize client library
    const DLP = require('@google-cloud/dlp').v2;
    const dlp = new DLP.DlpServiceClient();

    // Construct job request
    const request = {
      parent: `projects/${projectId}/locations/global`,
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
    const [response] = await dlp.createDlpJob(request);
    return response.name;
  };

  // Create a test job
  let testJobName;
  before(async () => {
    testJobName = await createTestJob();
    await deleteStaleJobs();
  });

  async function deleteStaleJobs() {
    const dlp = new DLP.DlpServiceClient();
    const request = {
      parent: `projects/${projectId}/locations/global`,
      filter: 'state=DONE',
      type: 'RISK_ANALYSIS_JOB',
    };
    const [jobs] = await dlp.listDlpJobs(request);
    for (const job of jobs) {
      const TEN_HOURS_MS = 1000 * 60 * 60 * 10;
      const created = Number(job.createTime.seconds) * 1000;
      const now = Date.now();
      if (now - created > TEN_HOURS_MS) {
        console.info(`delete ${job.name}`);
        await dlp.deleteDlpJob({name: job.name});
      }
    }
  }

  // dlp_list_jobs
  it('should list jobs', async function () {
    this.retries(5);
    await delay(this.test);
    const output = execSync(
      `node listJobs.js ${projectId} 'state=DONE' RISK_ANALYSIS_JOB`
    );
    assert.match(
      output,
      /Job projects\/(\w|-)+\/locations\/global\/dlpJobs\/\w-\d+ status: DONE/
    );
  });

  it('should list jobs of a given type', async function () {
    this.retries(7);
    await delay(this.test);
    const output = execSync(
      `node listJobs.js ${projectId} 'state=DONE' RISK_ANALYSIS_JOB`
    );
    assert.match(
      output,
      /Job projects\/(\w|-)+\/locations\/global\/dlpJobs\/r-\d+ status: DONE/
    );
  });

  it('should handle job listing errors', () => {
    let output;
    try {
      output = execSync(`node listJobs.js ${projectId} 'state=NOPE'`);
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_delete_job
  it('should delete job', () => {
    const output = execSync(`node deleteJob.js ${projectId} ${testJobName}`);
    assert.include(output, `Successfully deleted job ${testJobName}.`);
  });

  it('should handle job deletion errors', () => {
    let output;
    try {
      output = execSync(`node deleteJob.js ${projectId} ${badJobName}`);
    } catch (err) {
      output = err.message;
    }
    console.log(output);
    assert.match(output, /Error in deleteJob/);
  });
});
