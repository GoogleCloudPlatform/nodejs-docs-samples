/**
 * Copyright 2018, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const {assert} = require('chai');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmdDataset = `node vision/automlVisionDataset.js`;
const cmdModel = `node vision/automlVisionModel.js`;
const cmdPredict = `node vision/automlVisionPredict.js`;

const testDataSetName = `testDataSet`;
const dummyDataSet = `dummyDataSet`;
const testModelName = `dummyModel`;
const testImgPath = `./resources/`;
const sampleImage2 = path.join(testImgPath, `testImage2.jpg`);

describe(`auto ml vision`, () => {
  it.skip(`should create, list, and delete a dataset`, async () => {
    // Check to see that this dataset does not yet exist
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.strictEqual(output.includes(testDataSetName), false);

    // Create dataset
    output = execSync(`${cmdDataset} create-dataset -n "${testDataSetName}"`);
    const dataSetId = output
      .split(`\n`)[1]
      .split(`:`)[1]
      .trim();
    assert.match(output, new RegExp(testDataSetName));

    // Delete dataset
    output = execSync(`${cmdDataset} delete-dataset -i "${dataSetId}"`);
    assert.match(output, /Dataset deleted./);
  });

  // See : https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/vision/automl/model_test.py
  // We make two models running this test, see hard-coded workaround below
  it.skip(`should create a dataset, import data, and start making a model`, async () => {
    // Check to see that this dataset does not yet exist
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.strictEqual(output.includes(dummyDataSet), false);

    // Create dataset
    output = execSync(`${cmdDataset} create-dataset -n "${dummyDataSet}"`);
    const dataSetId = output
      .split(`\n`)[1]
      .split(`:`)[1]
      .trim();
    assert.match(output, new RegExp(dummyDataSet));

    // Import Data
    output = execSync(
      `${cmdDataset} import-data -i "${dataSetId}" -p "gs://nodejs-docs-samples-vcm/flowerTraindata20lines.csv"`
    );
    assert.match(output, /Data imported./);

    // Check to make sure model doesn't already exist
    output = execSync(`${cmdModel} list-models`);
    assert.notMatch(output, new RegExp(testModelName));

    // begin training dataset, getting operation ID for next operation
    output = execSync(`
      ${cmdModel} create-model -i "${dataSetId}" -m "${testModelName}" -t "2"`);
    const operationName = output
      .split(`\n`)[0]
      .split(`:`)[1]
      .split(`/`)
      .pop()
      .trim();
    assert.match(output, /Training started.../);

    // poll operation status, here confirming that operation is not complete yet
    output = execSync(
      `${cmdModel} get-operation-status -i "${dataSetId}" -o "${operationName}"`
    );
    assert.match(output, /done: false/);
  });

  it.skip(`should display evaluation from prexisting model`, async () => {
    const flowersModelId = `ICN723541179344731436`;
    const flowersDisplayName = `flowersTest`;

    // Confirm dataset exists
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, new RegExp(flowersDisplayName));

    // List model evaluations, confirm model exists
    output = execSync(
      `${cmdModel} list-model-evaluations -a "${flowersModelId}"`
    );

    // Display evaluation
    output = execSync(`${cmdModel} display-evaluation -a "${flowersModelId}"`);
    assert.match(output, /Model Precision/);
  });

  it.skip(`should run Prediction from prexisting model`, async () => {
    const donotdeleteModelId = `ICN723541179344731436`;
    const flowersDisplayName = `flowers`;

    // Confirm dataset exists
    let output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, new RegExp(flowersDisplayName));

    // List model evaluations, confirm model exists
    output = execSync(
      `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
    );
    // Run prediction on 'testImage.jpg' in resources folder
    output = execSync(
      `${cmdPredict} predict -i "${donotdeleteModelId}" -f "${sampleImage2}" -s "0.5"`
    );
    assert.match(output, /dandelion/);
  });

  // List datasets
  it(`should list datasets`, async () => {
    const output = execSync(`${cmdDataset} list-datasets`);
    assert.match(output, /List of datasets:/);
  });
});
