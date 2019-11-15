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
const {execSync} = require('child_process');

/** Tests for AutoML Tables "Prediction API" sample. */

const cmdPredict = 'node automlTablesPrediction.js';

// // TODO(developer): Before running the test cases, set the environment
// variables PROJECT_ID, REGION_NAME and
// change modelId, gcsInputUri, gcsOutputUriPrefix, bqInputUri and
// bqOutputUriPrefix.
//const projectId = process.env.PROJECT_ID;
//const computeRegion = process.env.REGION_NAME;
const modelId = 'TBL3613734080685801472';
const filePath = './resource/predictTest.csv';
const gcsInputUri = 'gs://automl-tables/input/test.csv';
const gcsOutputUriPrefix = 'gs://automl-tables/output';
const bqInputUri = 'bq://automl-tables-bg-input';
const bqOutputUriPrefix = 'bq://automl-tables-bg-output';

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('Tables PredictionAPI', () => {
  it.skip(`should perform single prediction`, async () => {
    // Run single prediction on predictTest.csv in resource folder
    const output = exec(`${cmdPredict} predict "${modelId}" "${filePath}"`);
    assert.match(output, /Prediction results:/);
  });

  it.skip(`should perform batch prediction using GCS as source and
    GCS as destination`, async () => {
    // Run batch prediction using GCS as source and GCS as destination
    const output = exec(
      `${cmdPredict} predict-using-gcs-source-and-gcs-dest "${modelId}"` +
        ` "${gcsInputUri}" "${gcsOutputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });

  it.skip(`should perform batch prediction using BQ as source and
    GCS as destination`, async () => {
    //  Run batch prediction using BQ as source and GCS as destination
    const output = exec(
      `${cmdPredict} predict-using-bq-source-and-gcs-dest "${modelId}"` +
        ` "${bqInputUri}" "${gcsOutputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });

  it.skip(`should perform batch prediction using GCS as source and
    BQ as destination`, async () => {
    // Run batch prediction using GCS as source and BQ as destination
    const output = exec(
      `${cmdPredict} predict-using-gcs-source-and-bq-dest "${modelId}"` +
        ` "${gcsInputUri}" "${bqOutputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });

  it.skip(`should perform batch prediction using BQ as source and
    BQ as destination`, async () => {
    // Run batch prediction using BQ as source and BQ as destination
    const output = exec(
      `${cmdPredict} predict-using-bq-source-and-bq-dest "${modelId}"` +
        ` "${bqInputUri}" "${bqOutputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });
});
