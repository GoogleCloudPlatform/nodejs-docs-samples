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

/** Tests for AutoML Natural Language Entity Extraction "Model API" sample. */

// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the value of datasetId, deployModelId and  undeployModelId
const projectId = process.env.PROJECT_ID;
const computeRegion = process.env.REGION_NAME;
const filter = 'textExtractionModelMetadata:*';
const datasetId = 'TEN1795159440530341888';
const testModelName = 'test_entity_model';
const deployModelId = 'TEN8143123852797411328';
const undeployModelId = 'TEN4279035372513525760';

const exec = async cmd => (await execa.shell(cmd)).stdout;

describe.skip(`Language Entity ModelAPI`, () => {
  it(`should create  a model`, async () => {
    // Create model
    let output = await exec(
      `node create-model.v1beta1.js "${projectId}" "${computeRegion}" "${datasetId}" "${testModelName}"`
    );
    const operationName = output
      .split('\n')[0]
      .split(':')[1]
      .trim();
    assert.match(output, /Training started.../);

    // Get operation status
    // Poll operation status, here confirming that operation is not complete yet
    output = await exec(
      `node get-operation-status.v1beta1.js "${operationName}"`
    );
    assert.match(output, /Operation details:/);
  });

  it(`should list models, get and delete a model. list, get and display model
    evaluations from preexisting models`, async () => {
    // List models
    let output = await exec(
      `node list-models.v1beta1.js "${projectId}" "${computeRegion}" "${filter}"`
    );
    const parsedOut = output.split('\n');
    const outputModelId = parsedOut[3].split(':')[1].trim();
    assert.match(output, /List of models:/);

    // Get model
    output = await exec(`node get-model.v1beta1.js "${outputModelId}"`);
    assert.match(output, /Model name:/);

    // List model evaluations
    output = await exec(
      `node list-model-evaluations.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"`
    );
    const parsedModelEvaluation = output.split('\n');
    const modelEvaluationId = parsedModelEvaluation[3].split(':')[1].trim();
    assert.match(output, /Model evaluation Id:/);

    // Get model evaluation
    output = await exec(
      `node get-model-evaluation.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}" ` +
        `"${modelEvaluationId}"`
    );
    assert.match(output, /Model evaluation Id:/);

    // Display evaluation
    output = await exec(
      `node display-evaluation.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"`
    );
    assert.match(output, /Model Evaluation ID:/);

    // Delete Model
    output = await exec(
      `node delete-model.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"`
    );
    assert.match(output, /Model delete details:/);
  });

  it(`should list and get operation status`, async () => {
    // List operation status
    let output = await exec(
      `node list-operations-status.v1beta1.js "${projectId}" "${computeRegion}"`
    );
    const parsedOut = output.split('\n');
    const operationFullId = parsedOut[3].split(':')[1].trim();

    // Get operation status
    // Poll operation status, here confirming that operation is not complete yet
    output = await exec(
      `node get-operation-status.v1beta1.js "${operationFullId}"`
    );
    assert.match(output, /Operation details:/);
  });

  it(`should deploy the model`, async () => {
    // Deploy the model
    const output = await exec(
      `node deploy-model.v1beta1.js "${projectId}" "${computeRegion}" "${deployModelId}"`
    );
    assert.match(output, /Name:/);
  });

  it(`should undeploy the model`, async () => {
    // Undeploy the model
    const output = await exec(
      `node undeploy-model.v1beta1.js  "${projectId}" "${computeRegion}" "${undeployModelId}"`
    );
    assert.match(output, /Name:/);
  });
});
