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

const cwd = path.join(__dirname, '..');
const projectId = process.env.GCLOUD_PROJECT;
const datasetId = `dataset-${uuid.v4()}`.replace(/-/gi, '_');
const destinationDatasetId = `destination-${uuid.v4()}`.replace(/-/gi, '_');
const keeplistTags = 'PatientID';
const cloudRegion = 'us-central1';

before(tools.checkCredentials);
after(async () => {
  try {
    await tools.runAsync(
      `node deleteDataset.js ${projectId} ${cloudRegion} ${destinationDatasetId}`,
      cwd
    );
    // eslint-disable-next-line no-empty
  } catch (err) {} // Ignore error
});

it('should create a dataset', async () => {
  const output = await tools.runAsync(
    `node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwd
  );
  assert.strictEqual(output, `Created dataset: ${datasetId}`);
});

it('should get a dataset', async () => {
  const output = await tools.runAsync(
    `node getDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwd
  );
  assert.ok(output.includes('name'));
});

it('should patch a dataset', async () => {
  const timeZone = 'GMT';
  const output = await tools.runAsync(
    `node patchDataset.js ${projectId} ${cloudRegion} ${datasetId} ${timeZone}`,
    cwd
  );
  assert.strictEqual(
    output,
    `Dataset ${datasetId} patched with time zone ${timeZone}`
  );
});

it('should list datasets', async () => {
  const output = await tools.runAsync(
    `node listDatasets.js ${projectId} ${cloudRegion}`,
    cwd
  );
  assert.ok(output.includes('datasets'));
});

it('should de-identify data in a dataset and write to a new dataset', async () => {
  const output = await tools.runAsync(
    `node deidentifyDataset.js ${projectId} ${cloudRegion} ${datasetId} ${destinationDatasetId} ${keeplistTags}`,
    cwd
  );
  assert.strictEqual(
    output,
    `De-identified data written from dataset ${datasetId} to dataset ${destinationDatasetId}`
  );
});

it('should create and get a dataset IAM policy', async () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = await tools.runAsync(
    `node setDatasetIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${localMember} ${localRole}`,
    cwd
  );
  assert.ok(output.includes, 'ETAG');

  output = await tools.runAsync(
    `node getDatasetIamPolicy.js ${projectId} ${cloudRegion} ${datasetId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should delete a dataset', async () => {
  const output = await tools.runAsync(
    `node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwd
  );
  assert.strictEqual(output, `Deleted dataset: ${datasetId}`);
});
