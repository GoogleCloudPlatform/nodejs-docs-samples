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

/** Tests for AutoML Natural Language Sentiment Analysis "Dataset API" sample.*/

const cmdDataset = 'node automlNaturalLanguageSentimentDataset.js';

// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the value of datasetId, datasetName, sentimentMax and importDataCsv.
const projectId = process.env.PROJECT_ID;
//const computeRegion = process.env.REGION_NAME;
const bucket = projectId + '-lcm';
const datasetName = 'test_language_dataset';
const filter = 'textSentimentDatasetMetadata:*';
const sentimentMax = 4;
const datasetId = 'TST1814315223123098195';
const importDataCsv = 'gs://' + projectId + '-lcm/automl-sentiment/train.csv';

const exec = async cmd => (await execa.shell(cmd)).stdout;

describe.skip('Language Sentiment DatasetAPI', () => {
  it(`should create, import and delete a dataset`, async () => {
    // Create dataset
    let output = await exec(
      `${cmdDataset} create-dataset "${datasetName}" "${sentimentMax}"`
    );
    const parsedOut = output.split('\n');
    const outputDatasetId = parsedOut[1].split(':')[1].trim();
    assert.match(output, /Dataset display name:/);

    // Import Data
    output = await exec(
      `${cmdDataset} import-data "${outputDatasetId}" "${importDataCsv}"`
    );
    assert.match(output, /Processing import.../);

    // Delete dataset
    output = await exec(`${cmdDataset} delete-dataset "${outputDatasetId}"`);
    assert.match(output, /Dataset delete details:/);
  });

  it(`should list datasets`, async () => {
    // List datasets
    const output = await exec(`${cmdDataset} list-datasets "${filter}"`);
    assert.match(output, /List of datasets:/);
  });

  it(`should get preexisting dataset`, async () => {
    // Get dataset
    const output = await exec(`${cmdDataset} get-dataset "${datasetId}"`);
    assert.match(output, /Dataset display name:/);
  });

  it(`should export dataset`, async () => {
    // Export data
    const outputUri = 'gs://' + bucket + '/' + datasetId;
    const output = await exec(
      `${cmdDataset} export-data ${datasetId} ${outputUri}`
    );
    assert.match(output, /Processing export.../);
  });
});
