/**
 * Copyright 2018, Google, LLC
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cmd = `node datasets.js`;
const cwd = path.join(__dirname, `..`);
const datasetId = `dataset-${uuid.v4()}`.replace(/-/gi, '_');
const destinationDatasetId = `destination-${uuid.v4()}`.replace(/-/gi, '_');
const whitelistTags = 'PatientID';

test.before(tools.checkCredentials);
test.after.always(async () => {
  try {
    await tools.runAsync(`${cmd} deleteDataset ${destinationDatasetId}`, cwd);
  } catch (err) {} // Ignore error
});

test.serial(`should create a dataset`, async t => {
  const output = await tools.runAsync(`${cmd} createDataset ${datasetId}`, cwd);
  t.is(output, `Created dataset: ${datasetId}`);
});

test.serial(`should get a dataset`, async t => {
  const output = await tools.runAsync(`${cmd} getDataset ${datasetId}`, cwd);
  t.regex(output, /name/);
  t.regex(output, /timeZone/);
});

test.serial(`should patch a dataset`, async t => {
  const patchTimeZone = 'GMT';
  const output = await tools.runAsync(
    `${cmd} patchDataset ${datasetId} ${patchTimeZone}`,
    cwd
  );
  t.is(output, `Dataset ${datasetId} patched with time zone ${patchTimeZone}`);
});

test.serial(`should list datasets`, async t => {
  const output = await tools.runAsync(`${cmd} listDatasets`, cwd);
  t.regex(output, /datasets/);
});

test.serial(
  `should de-identify data in a dataset and write to a new dataset`,
  async t => {
    const output = await tools.runAsync(
      `${cmd} deidentifyDataset ${datasetId} ${destinationDatasetId} ${whitelistTags}`,
      cwd
    );
    t.is(
      output,
      `De-identified data written from dataset
            ${datasetId} to dataset ${destinationDatasetId}`
    );
  }
);

test.serial(`should delete a dataset`, async t => {
  const output = await tools.runAsync(`${cmd} deleteDataset ${datasetId}`, cwd);
  t.is(output, `Deleted dataset: ${datasetId}`);
});
