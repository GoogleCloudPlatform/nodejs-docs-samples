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

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const cmd = 'node datasets.js';
const cwd = path.join(__dirname, '..');
const datasetId = `dataset-${uuid.v4()}`.replace(/-/gi, '_');
const destinationDatasetId = `destination-${uuid.v4()}`.replace(/-/gi, '_');
const keeplistTags = 'PatientID';

before(tools.checkCredentials);
after(async () => {
  try {
    await tools.runAsync(`${cmd} deleteDataset ${destinationDatasetId}`, cwd);
    // eslint-disable-next-line no-empty
  } catch (err) {} // Ignore error
});

it('should create a dataset', async () => {
  const output = await tools.runAsync(
    `$node createDataset.js ${datasetId}`,
    cwd
  );
  assert.strictEqual(output, `Created dataset: ${datasetId}`);
});

it('should get a dataset', async () => {
  const output = await tools.runAsync(`${cmd} getDataset ${datasetId}`, cwd);
  assert.strictEqual(new RegExp(/name/).test(output), true);
  assert.strictEqual(new RegExp(/timeZone/).test(output), true);
});

it('should patch a dataset', async () => {
  const patchTimeZone = 'GMT';
  const output = await tools.runAsync(
    `${cmd} patchDataset ${datasetId} ${patchTimeZone}`,
    cwd
  );
  assert.strictEqual(
    output,
    `Dataset ${datasetId} patched with time zone ${patchTimeZone}`
  );
});

it('should list datasets', async () => {
  const output = await tools.runAsync(`${cmd} listDatasets`, cwd);
  assert.strictEqual(new RegExp(/datasets/).test(output), true);
});

it('should de-identify data in a dataset and write to a new dataset', async () => {
  const output = await tools.runAsync(
    `${cmd} deidentifyDataset ${datasetId} ${destinationDatasetId} ${keeplistTags}`,
    cwd
  );
  assert.strictEqual(
    output,
    `De-identified data written from dataset
            ${datasetId} to dataset ${destinationDatasetId}`
  );
});

it('should delete a dataset', async () => {
  const output = await tools.runAsync(`${cmd} deleteDataset ${datasetId}`, cwd);
  assert.strictEqual(output, `Deleted dataset: ${datasetId}`);
});
