/**
 * Copyright 2017, Google, Inc.
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

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const {
  runAsync
} = require(`@google-cloud/nodejs-repo-tools`);

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const QUEUE = process.env.GCP_QUEUE;
const cmd = `node tasks.js`;
const cwd = path.join(__dirname, `..`);

test.before((t) => {
  if (!QUEUE) {
    t.fail(`You must set the GCP_QUEUE environment variable!`);
  }
});
test.before(tools.checkCredentials);

let task;

test.serial(`should create a task`, async (t) => {
  const output = await runAsync(`${cmd} create ${PROJECT_ID} us-central1 "${QUEUE}"`, cwd);
  t.true(output.includes('Created task'));
});

test.serial(`should pull a task`, async (t) => {
  t.plan(0);
  await tools.tryTest(async (assert) => {
    const output = await runAsync(`${cmd} pull ${PROJECT_ID} us-central1 "${QUEUE}"`, cwd);
    const matches = output.match(/^Pulled task ({.+})$/);
    if (matches && matches.length > 1) {
      task = matches[1];
    }
    assert(output.includes(`Pulled task`));
  }).start();
});

test.serial(`should acknowledge a task`, async (t) => {
  if (task) {
    const output = await runAsync(`${cmd} acknowledge '${task}'`, cwd);
    t.true(output.includes(`Acknowledged task`));
  } else {
    t.fail(`no task to acknowledge`);
  }
});
