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

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const {runAsync} = require(`@google-cloud/nodejs-repo-tools`);

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const QUEUE = process.env.QUEUE_ID || 'my-appengine-queue';
const cmd = `node createTask.js`;
const cwd = path.join(__dirname, `..`);

test.before((t) => {
  if (!QUEUE) {
    t.fail(`You must set the QUEUE_ID environment variable!`);
  }
});
test.before(tools.checkCredentials);

test.serial(`should create a task`, async (t) => {
  const output = await runAsync(`${cmd} --project=${PROJECT_ID} --location=us-central1 --queue=${QUEUE}`, cwd);
  t.true(output.includes('Created task'));
});
