/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const execa = require('execa');

/** Tests for AutoML Natural Language Entity Extraction - Dataset Operations */
// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the value of datasetId
const projectId = process.env.PROJECT_ID;
const computeRegion = process.env.REGION_NAME;
const bucket = projectId + '-entity';
const datasetName = 'test_language_dataset';
const filter = 'textExtractionDatasetMetadata:*';
const datasetId = 'TEN1866654084614848512';
const importDataCsv = 'gs://cloud-ml-data/NL-entity/dataset.csv';

const exec = async cmd => (await execa.shell(cmd)).stdout;

describe.skip(`Language Entity DatasetAPI`, () => {
  it(`should create, import and delete a dataset`, async () => {
    // Create dataset
    let output = await exec(
      `node create-dataset.v1beta1.js "${projectId}" "${computeRegion}" "${datasetName}"`
    );
    const parsedOut = output.split('\n');
    const outputDatasetId = parsedOut[1].split(':')[1].trim();
    assert.match(output, /Dataset display name:/);

    // Import data
    output = await exec(
      `node import-data.v1beta1.js "${projectId}" "${computeRegion}" "${outputDatasetId}" "${importDataCsv}"`
    );
    assert.match(output, /Processing import.../);

    // Delete dataset
    output = await exec(
      `node delete-dataset.v1beta1.js "${projectId}" "${computeRegion}" "${outputDatasetId}"`
    );
    assert.match(output, /Dataset delete details:/);
  });

  it(`should list datasets`, async () => {
    // List datasets
    const output = await exec(
      `node list-datasets.v1beta1.js "${projectId}" "${computeRegion}" "${filter}"`
    );
    assert.match(output, /List of datasets:/);
  });

  it(`should get preexisting dataset`, async () => {
    // Get dataset
    const output = await exec(
      `node get-dataset.v1beta1.js  "${projectId}" "${computeRegion}" "${datasetId}"`
    );
    assert.match(output, /Dataset display name:/);
  });

  it(`should export dataset`, async () => {
    // Export data
    const outputUri = 'gs://' + bucket + '/' + datasetId;
    const output = await exec(
      `node export-data.v1beta1.js  "${projectId}" "${computeRegion}" "${datasetId}" "${outputUri}"`
    );
    assert.match(output, /Processing export../);
  });
});
