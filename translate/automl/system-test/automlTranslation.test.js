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

const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmdDataset = `node automlTranslationDataset.js`;
const cmdModel = `node automlTranslationModel.js`;
const cmdPredict = `node automlTranslationPredict.js`;

const testDataSetName = `testDataSet`;
const dummyDataSet = `dummyDataSet`;
const testModelName = 'dummyModel';
const sampleText = `./resources/testInput.txt`;

const donotdeleteModelId = `TRL188026453969732486`;

// Skipped because it's been taking too long to delete datasets
test.skip(`should create a create, list, and delete a dataset`, async t => {
  // Check to see that this dataset does not yet exist
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  t.false(output.includes(testDataSetName));

  // Create dataset
  output = await tools.runAsync(
    `${cmdDataset} create-dataset -n "${testDataSetName}"`
  );
  const dataSetId = output
    .split(`\n`)[1]
    .split(`:`)[1]
    .trim();
  t.true(output.includes(`Dataset display name:  ${testDataSetName}`));

  // Delete dataset
  output = await tools.runAsync(
    `${cmdDataset} delete-dataset -i "${dataSetId}"`
  );
  t.true(output.includes(`Dataset deleted.`));
});

// We make two models running this test, see hard-coded workaround below
test.skip(`should create a dataset, import data, and start making a model`, async t => {
  // Check to see that this dataset does not yet exist
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  t.false(output.includes(dummyDataSet));

  // Create dataset
  output = await tools.runAsync(
    `${cmdDataset} create-dataset -n "${dummyDataSet}"`
  );
  const dataSetId = output
    .split(`\n`)[1]
    .split(`:`)[1]
    .trim();
  t.true(output.includes(`Dataset display name:  ${dummyDataSet}`));

  // Import Data
  output = await tools.runAsync(
    `${cmdDataset} import-data -i "${dataSetId}" -p "gs://nodejs-docs-samples-vcm/flowerTraindata20lines.csv"`
  );
  t.true(output.includes(`Data imported.`));

  // Check to make sure model doesn't already exist
  output = await tools.runAsync(`${cmdModel} list-models`);
  t.false(output.includes(`${testModelName}`));

  // Begin training dataset, getting operation ID for next operation
  output = await tools.runAsync(
    `${cmdModel} create-model -i "${dataSetId}" -m "${testModelName}" -t "2"`
  );
  const operationName = output
    .split(`\n`)[0]
    .split(`:`)[1]
    .trim();
  t.true(output.includes(`Training started...`));

  // Poll operation status, here confirming that operation is not complete yet
  output = await tools.runAsync(
    `${cmdModel} get-operation-status -i "${dataSetId}" -o "${operationName}"`
  );
  t.true(output.includes(`done: false`));
});

test(`should run get model (from a prexisting model)`, async t => {
  // Confirm dataset exists
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  t.true(output.includes(`me_do_not_delete`));

  // List model evaluations, confirm model exists
  output = await tools.runAsync(
    `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
  );
  t.true(output.includes(`translationEvaluationMetrics:`));

  // Get model evaluation
  output = await tools.runAsync(
    `${cmdModel} get-model -a "${donotdeleteModelId}"`
  );
  t.true(output.includes(`Model deployment state: DEPLOYED`));
});

test(`should run Prediction from prexisting model`, async t => {
  // Confirm dataset exists
  let output = await tools.runAsync(`${cmdDataset} list-datasets`);
  t.true(output.includes(`me_do_not_delete`));

  // List model evaluations, confirm model exists
  output = await tools.runAsync(
    `${cmdModel} list-model-evaluations -a "${donotdeleteModelId}"`
  );
  t.true(output.includes(`translationEvaluationMetrics:`));

  // Run prediction on 'testImage.jpg' in resources folder
  output = await tools.runAsync(
    `${cmdPredict} predict -i "${donotdeleteModelId}" -f "${sampleText}" -t "False"`
  );
  t.true(
    output.includes(`Translated Content:  これがどのように終わるか教えて`)
  );
});

// List datasets
test(`should list datasets`, async t => {
  const output = await tools.runAsync(`${cmdDataset} list-datasets`);
  t.true(output.includes(`List of datasets:`));
});
