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

const bigquery = require(`@google-cloud/bigquery`)();
const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cwd = path.join(__dirname, `..`);
const cmd = `node datasets.js`;
const datasetId = (`nodejs-docs-samples-test-${uuid.v4()}`).replace(/-/gi, '_');

test.after.always(async () => {
  try {
    await bigquery.dataset(datasetId).delete({ force: true });
  } catch (err) {} // ignore error
});

test.before(tools.checkCredentials);
test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`should create a dataset`, async (t) => {
  const output = await tools.runAsync(`${cmd} create ${datasetId}`, cwd);
  t.is(output, `Dataset ${datasetId} created.`);
  const [exists] = await bigquery.dataset(datasetId).exists();
  t.true(exists);
});

test.serial(`should list datasets`, async (t) => {
  await tools.tryTest(async () => {
    const output = await tools.runAsync(`${cmd} list`, cwd);
    t.true(output.includes(`Datasets:`));
    t.true(output.includes(datasetId));
  }).start();
});

test.serial(`should return the size of a dataset`, async (t) => {
  let output = await tools.runAsync(`${cmd} size hacker_news bigquery-public-data`, cwd);
  t.true(output.includes(`Size of hacker_news`));
  t.true(output.includes(`MB`));
  output = await tools.runAsync(`${cmd} size ${datasetId}`, cwd);
  t.true(output.includes(`Size of ${datasetId}: 0 MB`));
});

test.serial(`should delete a dataset`, async (t) => {
  const output = await tools.runAsync(`${cmd} delete ${datasetId}`, cwd);
  t.is(output, `Dataset ${datasetId} deleted.`);
  const [exists] = await bigquery.dataset(datasetId).exists();
  t.false(exists);
});
