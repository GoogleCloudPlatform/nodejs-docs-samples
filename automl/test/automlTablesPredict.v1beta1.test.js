/**
 * Copyright 2019 Google LLC
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
const {delay} = require('./util');
const {describe, it} = require('mocha');
const {execSync} = require('child_process');

/** Tests for AutoML Tables "Prediction API" sample. */

const projectId = process.env.AUTOML_PROJECT_ID || 'cdpe-automl-tests';
const region = 'us-central1';
const modelId = process.env.TABLE_MODEL_ID;
const gcsInputUri = `gs://${projectId}-tables/predictTest.csv`;
const gcsOutputUriPrefix = `gs://${projectId}-tables/test_outputs/`;
const bqInputUri = `bq://${projectId}.automl_test.bank_marketing`;
const bqOutputUriPrefix = `bq://${projectId}`;

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('Tables PredictionAPI', () => {
  it('should perform single prediction', async function () {
    this.retries(5);
    await delay(this.test);

    const inputs = [
      {numberValue: 39}, // Age
      {stringValue: 'technician'}, // Job
      {stringValue: 'married'}, // MaritalStatus
      {stringValue: 'secondary'}, // Education
      {stringValue: 'no'}, // Default
      {numberValue: 52}, // Balance
      {stringValue: 'no'}, // Housing
      {stringValue: 'no'}, // Loan
      {stringValue: 'cellular'}, // Contact
      {numberValue: 12}, // Day
      {stringValue: 'aug'}, // Month
      {numberValue: 96}, // Duration
      {numberValue: 2}, //Campaign
      {numberValue: -1}, // PDays
      {numberValue: 0}, // Previous
      {stringValue: 'unknown'}, // POutcome
    ];

    const output = exec(
      `node tables/predict.v1beta1.js "${projectId}" "${region}" "${modelId}" '${JSON.stringify(
        inputs
      )}'`
    );

    assert.include(output, 'Prediction results:');
  });

  it(`should perform batch prediction using GCS as source and
    GCS as destination`, async function () {
    this.retries(5);
    await delay(this.test);

    // Run batch prediction using GCS as source and GCS as destination
    const output = exec(
      `node tables/predict-gcs-source-gcs-dest.v1beta1.js "${projectId}" "${region}" "${modelId}" "${gcsInputUri}" "${gcsOutputUriPrefix}"`
    );
    assert.include(output, 'Operation name:');
  });

  it.skip(`should perform batch prediction using BQ as source and
    GCS as destination`, async function () {
    this.retries(5);
    await delay(this.test);

    //  Run batch prediction using BQ as source and GCS as destination
    const output = exec(
      `node tables/predict-gcs-source-bq-dest.v1beta1.js predict-using-bq-source-and-gcs-dest "${modelId}"` +
        ` "${bqInputUri}" "${gcsOutputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });

  it(`should perform batch prediction using GCS as source and
    BQ as destination`, async function () {
    this.retries(5);
    await delay(this.test);

    // Run batch prediction using GCS as source and BQ as destination
    const output = exec(
      `node tables/predict-gcs-source-bq-dest.v1beta1.js "${projectId}" "${region}" "${modelId}" ` +
        ` "${gcsInputUri}" "${bqOutputUriPrefix}"`
    );
    assert.include(output, 'Operation name:');
  });

  it(`should perform batch prediction using BQ as source and
    BQ as destination`, async function () {
    this.retries(5);
    await delay(this.test);

    // Run batch prediction using BQ as source and BQ as destination
    const output = exec(
      `node tables/predict-bq-source-bq-dest.v1beta1.js "${projectId}" "${region}" "${modelId}"` +
        ` "${bqInputUri}" "${bqOutputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });
});
