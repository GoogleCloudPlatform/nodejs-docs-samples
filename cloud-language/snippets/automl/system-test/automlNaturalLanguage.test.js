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

const assert = require(`assert`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmdDataset = `node automlNaturalLanguageDataset.js`;
const cmdModel = `node automlNaturalLanguageModel.js`;
const cmdPredict = `node automlNaturalLanguagePredict.js`;

const testDataSetName = `testDataset`;
const dummyDataSet = `dummyDataset`;
const testModelName = `dummyModel`;
const sampleText = `./resources/test.txt`;

// Skipped because it's been taking too long to delete datasets
it.skip(`should create a create, list, and delete a dataset`, async () => {
  // Check to see that this dataset does not yet exist
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  //t.false(output.includes(testDataSetName));
  assert.notStrictEqual(RegExp(`testDataset`).test(output));

  // Create dataset
  output = await tools.runAsync(
    `${cmdDataset} create-dataset -n "${testDataSetName}"`
  );
  const parsedOut = output.split(`\n`);
  const dataSetId = parsedOut[1].split(`:`)[1].trim();
  assert(RegExp(`Dataset display name:  testDataset`).test(output));

  // Delete dataset
  output = await tools.runAsync(
    `${cmdDataset} delete-dataset -i "${dataSetId}"`
  );
  assert(RegExp(`Dataset deleted.`).test(output));
});

// See : https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/NaturalLanguage/automl/model_test.py
// We make two models running this test, see hard-coded workaround below
it.skip(`should create a dataset, import data, and start making a model`, async () => {
  // Check to see that this dataset does not yet exist
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  assert.notStrictEqual(RegExp(`dummyDataset`).test(output));

  // Create dataset
  output = await tools.runAsync(
    `${cmdDataset} create-dataset -n "${dummyDataSet}"`
  );

  const dataSetId = output
    .split(`\n`)[1]
    .split(`:`)[1]
    .trim();
  assert(RegExp(`Dataset display name:  dummyDataSet`).test(output));

  // Import Data
  output = await tools.runAsync(
    `${cmdDataset} import-data -i "${dataSetId}" -p "gs://nodejs-docs-samples-vcm/happiness.csv"`
  );
  assert(RegExp(`Data imported.`).test(output));

  // Check to make sure model doesn't already exist
  output = await tools.runAsync(`${cmdModel} list-models`);
  assert.notStrictEqual(RegExp(`dummyModel`).test(output));

  // Begin training dataset, getting operation ID for next operation
  output = await tools.runAsync(
    `${cmdModel} create-model -i "${dataSetId}" -m "${testModelName}" -t "2"`
  );
  const operationName = output
    .split(`\n`)[0]
    .split(`:`)[1]
    .trim();
  assert(RegExp(`Training started...`).test(output));

  // Poll operation status, here confirming that operation is not complete yet
  output = await tools.runAsync(
    `${cmdModel} get-operation-status -i "${dataSetId}" -o "${operationName}"`
  );
  assert(RegExp(`done: false`).test(output));
});

it(`should display evaluation from prexisting model`, async () => {
  const donotdeleteModelId = `TCN4740161257642267869`;

  // Confirm dataset exists
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  assert(RegExp(`dummyDb`).test(output));

  // List model evaluations, confirm model exists
  output = await tools.runAsync(
    `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
  );

  // Display evaluation
  output = await tools.runAsync(
    `${cmdModel} display-evaluation -a "${donotdeleteModelId}"`
  );
  assert(RegExp(`Model Precision:`).test(output));
});

it(`should run Prediction from prexisting model`, async () => {
  const donotdeleteModelId = `TCN4740161257642267869`;

  // Confirm dataset exists
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  assert(RegExp(`do_not_delete_me`).test(output));

  // List model evaluations, confirm model exists
  output = await tools.runAsync(
    `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
  );
  assert(RegExp(`classificationEvaluationMetrics:`).test(output));

  // Run prediction on 'test.txt' in resources folder
  output = await tools.runAsync(
    `${cmdPredict} predict -i "${donotdeleteModelId}" -f "${sampleText}" -s "0.5"`
  );
  assert(RegExp(`Firm_Cheese`).test(output));
});

// List datasets
it(`should list datasets`, async () => {
  const output = await tools.runAsync(`${cmdDataset} list-datasets`);
  assert(RegExp(`List of datasets:`).test(output));
});
