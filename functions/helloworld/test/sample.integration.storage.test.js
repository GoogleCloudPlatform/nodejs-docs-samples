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

// [START functions_storage_integration_test]
const childProcess = require(`child_process`);
const test = require(`ava`);
const uuid = require(`uuid`);

test.serial(`helloGCS: should print uploaded message`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();
  const filename = uuid.v4(); // Use a unique filename to avoid conflicts

  // Mock GCS call, as the emulator doesn't listen to GCS buckets
  const data = JSON.stringify({
    name: filename,
    resourceState: 'exists',
    metageneration: '1'
  });

  childProcess.execSync(`functions-emulator call helloGCS --data '${data}'`);

  // Check the emulator's logs
  const logs = childProcess.execSync(`functions-emulator logs read helloGCS --start-time ${startTime}`).toString();
  t.true(logs.includes(`File ${filename} uploaded.`));
});

test.serial(`helloGCS: should print metadata updated message`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();
  const filename = uuid.v4(); // Use a unique filename to avoid conflicts

  // Mock GCS call, as the emulator doesn't listen to GCS buckets
  const data = JSON.stringify({
    name: filename,
    resourceState: 'exists',
    metageneration: '2'
  });

  childProcess.execSync(`functions-emulator call helloGCS --data '${data}'`);

  // Check the emulator's logs
  const logs = childProcess.execSync(`functions-emulator logs read helloGCS --start-time ${startTime}`).toString();
  t.true(logs.includes(`File ${filename} metadata updated.`));
});

test.serial(`helloGCS: should print deleted message`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();
  const filename = uuid.v4(); // Use a unique filename to avoid conflicts

  // Mock GCS call, as the emulator doesn't listen to GCS buckets
  const data = JSON.stringify({
    name: filename,
    resourceState: 'not_exists',
    metageneration: '3'
  });

  childProcess.execSync(`functions-emulator call helloGCS --data '${data}'`);

  // Check the emulator's logs
  const logs = childProcess.execSync(`functions-emulator logs read helloGCS --start-time ${startTime}`).toString();
  t.true(logs.includes(`File ${filename} deleted.`));
});
// [END functions_storage_integration_test]
