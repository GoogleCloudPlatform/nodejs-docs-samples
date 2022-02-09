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

// [START functions_storage_system_test]
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const uuid = require('uuid');
const assert = require('assert');
const path = require('path');
const childProcess = require('child_process');
const moment = require('moment');
const promiseRetry = require('promise-retry');

// Use unique GCS filename to avoid conflicts between concurrent test runs
const gcsFileName = `test-${uuid.v4()}.txt`;

const localFileName = 'test.txt';
const bucketName = process.env.FUNCTIONS_DELETABLE_BUCKET;
if (!bucketName) {
  throw new Error('"FUNCTIONS_DELETABLE_BUCKET" env var must be set.');
}
if (!process.env.GCF_REGION) {
  throw new Error('"GCF_REGION" env var must be set.');
}
const bucket = storage.bucket(bucketName);
const baseCmd = 'gcloud functions';

describe('system tests', () => {
  // [END functions_storage_system_test]
  before(() => {
    childProcess.execSync(
      `gcloud functions deploy helloGCS --runtime nodejs16 --trigger-bucket=${bucketName} --region=${process.env.GCF_REGION}`
    );
  });

  after(() => {
    childProcess.execSync(
      `gcloud functions delete helloGCS --region=${process.env.GCF_REGION} --quiet`
    );
  });
  // [START functions_storage_system_test]
  it('helloGCS: should print event', async () => {
    // Subtract time to work-around local-GCF clock difference
    const startTime = moment().subtract(2, 'minutes').toISOString();

    // Upload file
    const filepath = path.join(__dirname, localFileName);
    await bucket.upload(filepath, {
      destination: gcsFileName,
    });

    // Wait for logs to become consistent
    await promiseRetry(retry => {
      const logs = childProcess
        .execSync(`${baseCmd} logs read helloGCS --start-time ${startTime}`)
        .toString();

      try {
        assert.ok(logs.includes(`File: ${gcsFileName}`));
        assert.ok(logs.includes('Event Type: google.storage.object.finalize'));
      } catch (err) {
        console.log('An error occurred, retrying:', err);
        retry(err);
      }
    });
  });
  // [END functions_storage_system_test]
});
