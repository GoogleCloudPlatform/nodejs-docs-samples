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
  spawnAsyncWithIO,
  runAsync
} = require(`@google-cloud/nodejs-repo-tools`);

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const QUEUE = process.env.GCP_QUEUE;
const cmd = `node tasks.js`;
const cwd = path.join(__dirname, `..`);

test.before((t) => {
  if (!QUEUE) {
    t.fail('You must set the GCP_QUEUE environment variable!');
  }
});
test.before(tools.checkCredentials);

let task;

test.serial(`should create a task`, async (t) => {
  const args = [`create`, PROJECT_ID, `us-central1`, QUEUE];
  const results = await spawnAsyncWithIO(cmd, args, cwd);
  t.regex(results.output, /Created task/);
});

test.serial(`should pull a task`, async (t) => {
  t.plan(0);
  await tools.tryTest(async (assert) => {
    const args = [`pull`, PROJECT_ID, `us-central1`, QUEUE];
    const results = await spawnAsyncWithIO(cmd, args, cwd);
    const matches = results.output.match(/^Pulled task ({.+})$/);
    if (matches) {
      const json = JSON.parse(matches[1]);
      if (json.tasks && json.tasks.length) {
        task = JSON.stringify(json.tasks[0]);
      }
    } else {
      throw new Error(`Should have pulled task.\n${results.output}`);
    }
    assert(results.output.includes(`Pulled task`));
  }).start();
});

test.serial(`should acknowledge a task`, async (t) => {
  if (task) {
    const command = `${cmd} acknowledge '${task}'`;
    const output = await runAsync(command, cwd);
    t.regex(output, /Acknowledged task/);
  } else {
    t.fail('no task to acknowledge');
  }
});
