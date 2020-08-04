// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const automl = require('@google-cloud/automl');

const cmdDataset = 'node translate/automlTranslateCreateDataset.js';
const cmdModel = 'node translate/automlTranslateCreateModel.js';
const cmdPredict = 'node translate/automlTranslatePredict.js';

const projectId = process.env.AUTOML_PROJECT_ID;
const datasetId = process.env.TRANSLATION_DATASET_ID;
const modelId = process.env.TRANSLATION_MODEL_ID;

const samplePredictionText = './translate/resources/testInput.txt';

describe('Translate AutoML sample tests', () => {
  it('should create and delete a dataset', async () => {
    const datasetDisplayName = `test_${uuid
      .v4()
      .replace(/-/g, '_')
      .substring(0, 20)}`;

    // Create dataset
    let output = execSync(
      `${cmdDataset} "${projectId}" "${datasetDisplayName}"`
    );

    //extract dataset id from the output
    const newDatasetId = output.split('\n')[1].split(':')[1].trim();
    assert.match(output, /Dataset id:/);

    // Delete the created dataset
    output = execSync(
      `node delete_dataset.js ${projectId} us-central1 ${newDatasetId}`
    );
    assert.match(output, /Dataset deleted/);
  });

  it('should create model and cancel the training operation', async () => {
    // create a model with pre-existing dataset
    let output = execSync(
      `${cmdModel} ${projectId} us-central1 ${datasetId} translate_test_model`
    );
    assert.match(output, /Training started../);
    const operationFullId = output
      .split('Training operation name:')[1]
      .split('\n')[0]
      .trim();

    assert.include(output, operationFullId);

    // cancel the training LRO.
    output = execSync(`node beta/cancel_operation.js ${operationFullId}`);
    assert.match(output, /Cancelled/);
  });

  it('should run Prediction from translation model', async () => {
    // Verify the model is deployed before trying to predict
    const client = new automl.AutoMlClient();

    const modelFullId = {
      name: client.modelPath(projectId, 'us-central1', modelId),
    };

    const [response] = await client.getModel(modelFullId);
    if (response.deploymentState !== 'DEPLOYED') {
      // Deploy model if it is not deployed
      const [operation] = await client.deployModel(modelFullId);

      // Wait for operation to complete.
      const [response] = await operation.promise();
      console.log(`Model deployment finished. ${response}`);
    }

    // Run prediction on 'testInput.txt' in resources folder
    const output = execSync(
      `${cmdPredict} "${projectId}" us-central1 "${modelId}" "${samplePredictionText}" "False"`
    );
    assert.match(output, /Translated Content:/);
  });
});
