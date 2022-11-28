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

'use strict';

const util = require('util');
const async = require('async');
const assert = require('assert');
const path = require('path');
const cp = require('child_process');
const {describe, it, before} = require('mocha');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const batchClient = new BatchServiceClient();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

// get a short ID for this test run that only contains characters that are valid in UUID
// (a plain UUID won't do because we want the "test-job-js" prefix and that would exceed the length limit)
const {customAlphabet} = require('nanoid');
const allowedChars = 'qwertyuiopasdfghjklzxcvbnm';
const testRunId = customAlphabet(allowedChars, allowedChars.length)();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

describe('Create jobs with container, template and bucket', () => {
  let projectId;
  let bucketName;

  before(async () => {
    projectId = await batchClient.getProjectId();
    bucketName = `batch-js-test-bucket-${testRunId}`;
    await createBucket(bucketName);
  });

  it('create a job with a container payload', async () => {
    const output = execSync(
      `node create/create_with_container_no_mounting.js ${projectId} us-central1 test-job-js-container-${testRunId}`,
      {cwd}
    );
    await waitForJobToSucceed(projectId, "us-central1", `test-job-js-container-${testRunId}`);
  });

  it('create a job with a GCS bucket', async () => {
    const output = execSync(
      `node create/create_with_mounted_bucket.js ${projectId} us-central1 test-job-js-bucket-${testRunId} ${bucketName}`,
      {cwd}
    );
    await waitForJobToSucceed(projectId, "us-central1", `test-job-js-bucket-${testRunId}`);
  });

  after(async () => {
    await cleanupBucket(bucketName);
  });
});

async function createBucket(bucketName) {
  // For default values see: https://cloud.google.com/storage/docs/locations and
  // https://cloud.google.com/storage/docs/storage-classes

  await storage.createBucket(bucketName, {
    location: 'US-CENTRAL1',
    storageClass: 'COLDLINE',
  });
}

async function cleanupBucket(bucketName) {
  // GCS bucket will fail to delete if it is non-empty.
  // There is no 'force=true' argument in the Node GCS client,
  // so we cannot use force deletion here and have to first delete all files,
  // and only then delete the actual bucket.
  for (let i = 0; i <= 3; i++) {
    await deleteFileInBucket(bucketName, `output_task_${i}.txt`);
  }
  await deleteBucket(bucketName);
}

async function deleteBucket(bucketName) {
  await storage.bucket(bucketName).delete();
}

async function deleteFileInBucket(bucketName, fileName) {
  await storage
    .bucket(bucketName)
    .file(fileName)
    .delete({ignoreNotFound: true});
}

async function waitForJobToSucceed(projectID, region, jobName) {
    const maxAttempts = 100;
    const pollInterval = 2000; // in milliseconds
    let succeeded = false;

    for (let i = 0; i < maxAttempts; i++) {
        let jobResponse = await getJob(projectID, region, jobName);
        let job = jobResponse[0];
        //console.log(util.inspect(job));
        if (job.status.state == 'SUCCEEDED') {
            succeeded = true;
            break;
        } else if (job.status.state == 'FAILED') {
            throw new Error("Test job failed");
        }
        await sleep(pollInterval);
    }
    if (! succeeded) {
      throw new Error("Timed out waiting for the batch job to succeed after ${maxAttempts} attempts");
    }
}

async function getJob(projectId, region, jobName) {
    const request = {
      name: `projects/${projectId}/locations/${region}/jobs/${jobName}`,
    };
    return await batchClient.getJob(request);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// The below is for debugging, because mocha won't show you the errors on test failures :(

// async function main() {

// const projectId = await batchClient.getProjectId();

// const output = execSync(
//     `node create/create_with_container_no_mounting.js ${projectId} us-central1 test-job-js-container-${testRunId}`,
//     {cwd}
//   );
//   assert(output !== null);
//   await waitForJobToSucceed(projectId, "us-central1", `test-job-js-container-${testRunId}`);

// }

// main();