// Copyright 2025 Google LLC
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

const {Storage, Bucket} = require('@google-cloud/storage');
const cp = require('child_process');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const projectId = process.env.GCLOUD_PROJECT;
const bucketPrefix = 'sbo-samples';
const bucketName = `${bucketPrefix}-${uuid.v4()}`;
const storage = new Storage();
const bucket = new Bucket(storage, bucketName);
const jobId = uuid.v4();
const jobName = `projects/${projectId}/locations/global/jobs/${jobId}`;

describe('Batch Operations', () => {
  before(async () => {
    await storage.createBucket(bucketName, {
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
      hierarchicalNamespace: {enabled: true},
    });
  });

  after(async () => {
    await bucket.delete();
  });

  it('should create a job', async () => {
    const output = execSync(
      `node createJob.js ${projectId} ${jobId} ${bucketName} objectPrefix`
    );
    assert.match(output, /Created job:/);
    assert.match(output, new RegExp(jobName));
  });

  it('should list jobs', async () => {
    const output = execSync(`node listJobs.js ${projectId}`);
    assert.match(output, new RegExp(jobName));
  });

  it('should run quickstart', async () => {
    const output = execSync(`node quickstart.js ${projectId} ${jobId}`);
    assert.match(output, /Got job:/);
    assert.match(output, new RegExp(jobName));
  });

  it('should get a job', async () => {
    const output = execSync(`node getJob.js ${projectId} ${jobId}`);
    assert.match(output, /Got job:/);
    assert.match(output, new RegExp(jobName));
  });

  it('should cancel a job', async () => {
    try {
      const output = execSync(`node cancelJob.js ${projectId} ${jobId}`);
      assert.match(output, /Cancelled job:/);
      assert.match(output, new RegExp(jobName));
    } catch (error) {
      // This might be expected if the job completed quickly or failed creation
      assert.match(error.message, /INFO: cancelJob threw: /);
    }
  });

  it('should delete a job', async () => {
    const output = execSync(`node deleteJob.js ${projectId} ${jobId}`);
    assert.match(output, /Deleted job:/);
    assert.match(output, new RegExp(jobName));
  });
});
