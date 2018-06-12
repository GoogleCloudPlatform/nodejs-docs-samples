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

// [START functions_storage_system_test]
const Storage = require(`@google-cloud/storage`);
const storage = Storage();
const uuid = require(`uuid`);
const test = require(`ava`);
const path = require(`path`);
const childProcess = require(`child_process`);
const localFileName = `test.txt`;

// Use unique GCS filename to avoid conflicts between concurrent test runs
const gcsFileName = `test-${uuid.v4()}.txt`;

const bucketName = process.env.FUNCTIONS_BUCKET;
const bucket = storage.bucket(bucketName);
const baseCmd = `gcloud functions`;

test.serial(`helloGCS: should print uploaded message`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();

  // Upload file
  const filepath = path.join(__dirname, localFileName);
  await bucket.upload(filepath, {
    destination: gcsFileName
  });

  // Wait for consistency
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Check logs
  const logs = childProcess.execSync(`${baseCmd} logs read helloGCS --start-time ${startTime}`).toString();
  t.true(logs.includes(`File ${gcsFileName} uploaded`));
});

test.serial(`helloGCS: should print metadata updated message`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();

  // Update file metadata
  const file = bucket.file(gcsFileName);
  await file.setMetadata(gcsFileName, { foo: `bar` });

  // Wait for consistency
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Check logs
  const logs = childProcess.execSync(`${baseCmd} logs read helloGCS --start-time ${startTime}`).toString();
  t.true(logs.includes(`File ${gcsFileName} metadata updated`));
});

test.serial(`helloGCS: should print deleted message`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();

  // Delete file
  bucket.deleteFiles();

  // Wait for consistency
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Check logs
  const logs = childProcess.execSync(`${baseCmd} logs read helloGCS --start-time ${startTime}`).toString();
  t.true(logs.includes(`File ${gcsFileName} deleted`));
});
// [END functions_storage_system_test]
