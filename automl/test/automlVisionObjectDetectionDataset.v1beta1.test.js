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
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

/** Tests for AutoML Vision Object Detection "Dataset API" sample. */
// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the value of datasetId
const projectId = 'nodejs-docs-samples';
const computeRegion = 'us-central1';
const outputPath = 'gs://nodejs-docs-samples/VISION_OBJECT_DETECTION/';
const datasetName = 'test_vision_create_dataset';
const filter = 'imageObjectDetectionDatasetMetadata:*';
const datasetId = 'ICN3946265060617537378';
const importDataCsv = 'gs://nodejs-docs-samples-vcm/flowerTraindata20lines.csv';

describe('Vision Object Detection DatasetAPI', () => {
  it.skip(`should create, import and delete a dataset`, async () => {
    // Create dataset
    let output = await execSync(
      `node vision/object-detection/create-dataset.v1beta1.js "${projectId}" "${computeRegion}" "${datasetName}"`
    );
    const parsedOut = output.split('\n');
    const outputDatasetId = parsedOut[1].split(':')[1].trim();
    assert.match(output, /Dataset display name:/);

    // Import data
    output = await execSync(
      `node vision/object-detection/import-data.v1beta1.js "${projectId}" "${computeRegion}" "${outputDatasetId}" "${importDataCsv}"`
    );
    assert.match(output, /Processing import.../);

    // Delete dataset
    output = await execSync(
      `node vision/object-detection/delete-dataset.v1beta1.js "${projectId}" "${computeRegion}" "${outputDatasetId}"`
    );
    assert.match(output, /Dataset delete details:/);
  });

  it.skip(`should list datasets`, async () => {
    // List datasets
    const output = await execSync(
      `node vision/object-detection/list-datasets.v1beta1.js "${projectId}" "${computeRegion}" "${filter}"`
    );
    assert.match(output, /List of datasets:/);
  });

  it.skip(`should get preexisting dataset`, async () => {
    // Get dataset
    const output = await execSync(
      `node vision/object-detection/get-dataset.v1beta1.js "${projectId}" "${computeRegion}" "${datasetId}"`
    );
    assert.match(output, /Dataset display name:/);
  });

  it.skip(`should export dataset`, async () => {
    // Export data
    const outputUri = outputPath + datasetId;
    const output = await execSync(
      `node vision/object-detection/export-data.v1beta1.js "${projectId}" "${computeRegion}" "${datasetId}" "${outputUri}"`
    );
    assert.match(output, /Processing export.../);
  });
});
