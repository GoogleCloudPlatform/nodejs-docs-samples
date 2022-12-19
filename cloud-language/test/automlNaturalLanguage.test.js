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

const cmdDataset = 'node automl/automlNaturalLanguageDataset.js';
const cmdModel = 'node automl/automlNaturalLanguageModel.js';
const cmdPredict = 'node automl/automlNaturalLanguagePredict.js';

const testDataSetName = 'testDataset';
const dummyDataSet = 'dummyDataset';
const testModelName = 'dummyModel';
const sampleText = './resources/test.txt';
const projectId = process.env.GCLOUD_PROJECT;

describe.skip('automl', () => {
  // Skipped because it's been taking too long to delete datasets
  it('should create a create, list, and delete a dataset', async () => {
    // Check to see that this dataset does not yet exist
    let output = execSync(`${cmdDataset} list-datasets`);
    //t.false(output.includes(testDataSetName));
    assert.notMatch(output, /testDataset/);

    // Create dataset
    output = execSync(`${cmdDataset} create-dataset -n "${testDataSetName}"`);
    const parsedOut = output.split('\n');
    const dataSetId = parsedOut[1].split(':')[1].trim();
    assert.match(output, /Dataset display name: {2}testDataset/);

    // Delete dataset
    output = execSync(`${cmdDataset} delete-dataset -i "${dataSetId}"`);
    assert.match(output, /Dataset deleted./);
  });

  // See : https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/NaturalLanguage/automl/model_test.py
  // We make two models running this test, see hard-coded workaround below
  it('should create a dataset, import data, and start making a model', async () => {
    // Check to see that this dataset does not yet exist
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.notMatch(output, /dummyDataset/);

    // Create dataset
    output = execSync(`${cmdDataset} create-dataset -n "${dummyDataSet}"`);

    const dataSetId = output.split('\n')[1].split(':')[1].trim();
    assert.match(output, /Dataset display name: {2}dummyDataSet/);

    // Import Data
    output = execSync(
      `${cmdDataset} import-data -i "${dataSetId}" -p "gs://nodejs-docs-samples-vcm/happiness.csv"`
    );
    assert.match(output, /Data imported./);

    // Check to make sure model doesn't already exist
    output = execSync(`${cmdModel} list-models`);
    assert.notMatch(output, /dummyModel/);

    // Begin training dataset, getting operation ID for next operation
    output = execSync(
      `${cmdModel} create-model -i "${dataSetId}" -m "${testModelName}" -t "2"`
    );
    const operationName = output.split('\n')[0].split(':')[1].trim();
    assert.match(output, /Training started.../);

    // Poll operation status, here confirming that operation is not complete yet
    output = execSync(
      `${cmdModel} get-operation-status -i "${dataSetId}" -o "${operationName}"`
    );
    assert.match(output, /done: false/);
  });

  it('should display evaluation from prexisting model', async () => {
    const donotdeleteModelId = 'TCN4740161257642267869';

    // Confirm dataset exists
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, /dummyDb/);

    // List model evaluations, confirm model exists
    output = execSync(
      `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
    );

    // Display evaluation
    output = execSync(
      `${cmdModel} display-evaluation -a "${donotdeleteModelId}"`
    );
    assert.match(output, /Model Precision:/);
  });

  it('should run Prediction from prexisting model', async () => {
    const donotdeleteModelId = 'TCN4740161257642267869';

    // Confirm dataset exists
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, /do_not_delete_me/);

    // List model evaluations, confirm model exists
    output = execSync(
      `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
    );
    assert.match(output, /classificationEvaluationMetrics:/);

    // Run prediction on 'test.txt' in resources folder
    output = execSync(
      `${cmdPredict} predict -i "${donotdeleteModelId}" -f "${sampleText}" -s "0.5"`
    );
    assert.match(output, /Firm_Cheese/);
  });

  // List datasets
  it('should list datasets', async () => {
    const output = execSync(`${cmdDataset} list-datasets ${projectId}`);
    assert.match(output, /List of datasets:/);
  });
});
