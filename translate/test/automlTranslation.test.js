// Copyright 2018 Google LLC
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

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmdDataset = 'node automlTranslationDataset.js';
const cmdModel = 'node automlTranslationModel.js';
const cmdPredict = 'node automlTranslationPredict.js';

const testDataSetName = 'testDataSet';
const dummyDataSet = 'dummyDataSet';
const testModelName = 'dummyModel';
const sampleText = './resources/testInput.txt';
const donotdeleteModelId = 'TRL188026453969732486';

describe.skip('automl sample tests', () => {
  it('should create a create, list, and delete a dataset', async () => {
    // Check to see that this dataset does not yet exist
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, new RegExp(testDataSetName));

    // Create dataset
    output = execSync(`${cmdDataset} create-dataset -n "${testDataSetName}"`);
    const dataSetId = output
      .split('\n')[1]
      .split(':')[1]
      .trim();
    assert.match(
      output,
      new RegExp(`Dataset display name:  ${testDataSetName}`)
    );

    // Delete dataset
    output = execSync(`${cmdDataset} delete-dataset -i "${dataSetId}"`);
    assert.match(output, /Dataset deleted./);
  });

  // We make two models running this test, see hard-coded workaround below
  it('should create a dataset, import data, and start making a model', async () => {
    // Check to see that this dataset does not yet exist
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.notMatch(output, new RegExp(dummyDataSet));

    // Create dataset
    output = execSync(`${cmdDataset} create-dataset -n "${dummyDataSet}"`);
    const dataSetId = output
      .split('\n')[1]
      .split(':')[1]
      .trim();
    assert.match(output, new RegExp(`Dataset display name:  ${dummyDataSet}`));

    // Import Data
    output = execSync(
      `${cmdDataset} import-data -i "${dataSetId}" -p "gs://nodejs-docs-samples-vcm/flowerTraindata20lines.csv"`
    );
    assert.match(output, /Data imported./);

    // Check to make sure model doesn't already exist
    output = execSync(`${cmdModel} list-models`);
    assert.notMatch(output, testModelName);

    // Begin training dataset, getting operation ID for next operation
    output = execSync(
      `${cmdModel} create-model -i "${dataSetId}" -m "${testModelName}" -t "2"`
    );
    const operationName = output
      .split('\n')[0]
      .split(':')[1]
      .trim();
    assert.match(output, 'Training started...');

    // Poll operation status, here confirming that operation is not complete yet
    output = execSync(
      `${cmdModel} get-operation-status -i "${dataSetId}" -o "${operationName}"`
    );
    assert.match(output, /done: false/);
  });

  it('should run get model (from a prexisting model)', async () => {
    // Confirm dataset exists
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, /me_do_not_delete/);

    // List model evaluations, confirm model exists
    output = execSync(
      `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
    );
    assert.match(output, /translationEvaluationMetrics:/);

    // Get model evaluation
    output = execSync(`${cmdModel} get-model -a "${donotdeleteModelId}"`);
    assert.match(output, /Model deployment state: DEPLOYED/);
  });

  it('should run Prediction from prexisting model', async () => {
    // Confirm dataset exists
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, /me_do_not_delete/);

    // List model evaluations, confirm model exists
    output = execSync(
      `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
    );
    assert.match(output, 'translationEvaluationMetrics:');

    // Run prediction on 'testImage.jpg' in resources folder
    output = execSync(
      `${cmdPredict} predict -i "${donotdeleteModelId}" -f "${sampleText}" -t "False"`
    );
    assert.match(
      output,
      /Translated Content: {2}これがどのように終わるか教えて/
    );
  });

  // List datasets
  it('should list datasets', async () => {
    const output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, /List of datasets:/);
  });
});
