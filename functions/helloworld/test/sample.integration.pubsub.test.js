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

// [START functions_pubsub_integration_test]
const childProcess = require(`child_process`);
const test = require(`ava`);
const uuid = require(`uuid`);

test.serial(`helloPubSub: should print a name`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();
  const name = uuid.v4();

  // Mock Pub/Sub call, as the emulator doesn't listen to Pub/Sub topics
  const encodedName = Buffer.from(name).toString(`base64`);
  const data = JSON.stringify({ data: encodedName });
  childProcess.execSync(`functions call helloPubSub --data '${data}'`);

  // Check the emulator's logs
  const logs = childProcess.execSync(`functions logs read helloPubSub --start-time ${startTime}`).toString();
  t.true(logs.includes(`Hello, ${name}!`));
});

test.serial(`helloPubSub: should print hello world`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();

  // Mock Pub/Sub call, as the emulator doesn't listen to Pub/Sub topics
  childProcess.execSync(`functions call helloPubSub --data {}`);

  // Check the emulator's logs
  const logs = childProcess.execSync(`functions logs read helloPubSub --start-time ${startTime}`).toString();
  t.true(logs.includes(`Hello, World!`));
});
// [END functions_pubsub_integration_test]
