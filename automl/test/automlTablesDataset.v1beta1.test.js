// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const {execSync} = require('child_process');

/** Tests for AutoML Tables "Dataset API" sample. */

const cmdDataset = 'node automlTablesDataset.js';

// TODO(developer): Before running the test cases, set the environment variables
// PROJECT_ID, REGION_NAME and change the values of datasetId,
// bigQueryDatasetId, importDataCsv, outputGcsUri, outputGcsUri and
// outputBigQueryUri.
//const projectId = process.env.PROJECT_ID;
//const computeRegion = process.env.REGION_NAME;
const datasetName = 'test_table_dataset';
const filter = 'tablesDatasetMetadata:*';
const datasetId = 'TBL2246891593778855936';
const bigQueryDatasetId = 'TBL5314616996204118016';
const importDataCsv = 'gs://automl-tables/input/train.csv';
const updateDatasetDisplayName = 'test_table_dataset_01';
const dataTypeCode = 'CATEGORY';
const outputGcsUri = 'gs://automl-tables/export-data/';
const outputBigQueryUri = 'bq://automl-tables-bg-output';

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('Tables DatasetAPI', () => {
  it.skip('should create, import, update and delete a dataset', async () => {
    // Create dataset
    let output = exec(`${cmdDataset} create-dataset "${datasetName}"`);
    const parsedOut = output.split('\n');
    const outputDatasetId = parsedOut[1].split(':')[1].trim();
    assert.match(output, /Dataset display name:/);

    // Import data
    output = exec(
      `${cmdDataset} import-data "${outputDatasetId}" "${importDataCsv}"`
    );
    assert.match(output, /Processing import.../);

    // Update dataset
    output = exec(
      `${cmdDataset} update-dataset "${outputDatasetId}"` +
        ` "${updateDatasetDisplayName}"`
    );
    assert.match(output, /Dataset Id:/);

    // Delete dataset
    output = exec(`${cmdDataset} delete-dataset "${outputDatasetId}"`);
    assert.match(output, /Dataset delete details:/);
  });

  it.skip('should list datasets', async () => {
    // List dataset
    const output = exec(`${cmdDataset} list-datasets "${filter}"`);
    assert.match(output, /Dataset Id:/);
  });

  it.skip('should get preexisting dataset', async () => {
    // Get dataset
    const output = exec(`${cmdDataset} get-dataset "${datasetId}"`);
    assert.match(output, /Dataset Id:/);
  });

  it.skip('should get,list,update tablespec and columnspec', async () => {
    // List table
    let output = exec(
      `${cmdDataset} list-table-specs` + ` "${datasetId}" "${filter}"`
    );
    let parsedOut = output.split('\n');
    const outputTableId = parsedOut[1]
      .split(':')[1]
      .trim()
      .split('/')[7];
    assert.match(output, /Table Id:/);

    // Get table
    output = exec(
      `${cmdDataset} get-table-spec` + ` "${datasetId}" "${outputTableId}"`
    );
    assert.match(output, /Table Id:/);

    // List column
    output = exec(
      `${cmdDataset} list-column-specs` + ` "${datasetId}" "${outputTableId}"`
    );
    parsedOut = output.split('\n');
    const outputColumnId = parsedOut[1]
      .split(':')[1]
      .trim()
      .split('/')[9];
    assert.match(output, /Column Id:/);

    // Get column
    output = exec(
      `${cmdDataset} get-column-spec` +
        ` "${datasetId}" "${outputTableId}" "${outputColumnId}"`
    );
    assert.match(output, /Column Id:/);

    // Update column
    output = exec(
      `${cmdDataset} update-column-spec` +
        ` "${datasetId}" "${outputTableId}" "${outputColumnId}" "${dataTypeCode}"`
    );
    assert.match(output, /Column Id:/);
  });

  it.skip('should export CSV dataset', async () => {
    // Export data to csv
    const output = exec(
      `${cmdDataset} export-data-to-csv` + ` "${datasetId}" "${outputGcsUri}"`
    );
    assert.match(output, /Processing export.../);
  });

  it.skip('should export BigQuery dataset', async () => {
    // Export data to bigquery
    const output = exec(
      `${cmdDataset} export-data-to-bigquery` +
        ` "${bigQueryDatasetId}" "${outputBigQueryUri}"`
    );
    assert.match(output, /Processing export.../);
  });
});
