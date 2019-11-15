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
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

/** Tests for AutoML Vision Object Detection "Model API" sample. */
// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the value of datasetId, deployModelId and  undeployModelId
const projectId = 'nodejs-docs-samples';
const computeRegion = 'us-central1';
const filter = 'imageObjectDetectionModelMetadata:*';
const datasetId = 'ICN3217071205693347964';
const testModelName = 'birds2_201804101601_base';
const deployModelId = 'IOD1728502647608049664';
const undeployModelId = 'IOD3348109663601164288';

describe(' Vision Object Detection ModelAPI', () => {
  it.skip(`should create a model`, async () => {
    let output = await execSync(
      `node vision/object-detection/create-model.v1beta1.js "${projectId}" "${computeRegion}" "${datasetId}" "${testModelName}"`
    );
    const operationName = output
      .split('\n')[0]
      .split(':')[1]
      .trim();
    assert.match(output, /Training started.../);

    output = await execSync(
      `node vision/object-detection/get-operation-status.v1beta1.js "${operationName}"`
    );
    assert.match(output, /Operation details:/);
  });

  it.skip(`should list models, get and delete a model. list, get and display model
    evaluations from preexisting models`, async () => {
    // List models
    let output = await execSync(
      `node vision/object-detection/list-models.v1beta1.js "${projectId}" "${computeRegion}" "${filter}"`
    );
    const parsedOut = output.split('\n');
    const outputModelId = parsedOut[3].split(':')[1].trim();
    assert.match(output, /List of models:/);

    // Get Model
    output = await execSync(
      `node vision/object-detection/get-model.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"`
    );
    assert.match(output, /Model name:/);

    // List model evaluation
    output = await execSync(
      `node vision/object-detection/list-model-evaluations.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"`
    );
    const parsedModelEvaluation = output.split('\n');
    const modelEvaluationId = parsedModelEvaluation[3].split(':')[1].trim();
    assert.match(output, /Model evaluation Id:/);

    // Get model evaluation
    output = await execSync(
      `node vision/object-detection/get-model-evaluation.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"` +
        ` "${modelEvaluationId}"`
    );
    assert.match(output, /Model evaluation Id:/);

    // Display evaluation
    output = await execSync(
      `node vision/object-detection/display-evaluation.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}" `
    );
    assert.match(output, /Model Evaluation ID:/);

    // Delete Model
    output = await execSync(
      `node vision/object-detection/delete-model.v1beta1.js "${projectId}" "${computeRegion}" "${outputModelId}"`
    );
    assert.match(output, /Model delete details:/);
  });

  it.skip(`should list and get operation status`, async () => {
    // List operation status
    let output = await execSync(
      `node vision/object-detection/list-operations-status.v1beta1.js`
    );
    const parsedOut = output.split('\n');
    const operationFullId = parsedOut[3].split(':')[1].trim();

    // Get operation status
    // Poll operation status, here confirming that operation is not complete yet
    output = await execSync(
      `node vision/object-detection/get-operation-status.v1beta1.js "${operationFullId}"`
    );
    assert.match(output, /Operation details:/);
  });

  it.skip(`should deploy the model`, async () => {
    // Deploy the model
    const output = await execSync(
      `node vision/object-detection/deploy-model.v1beta1.js "${projectId}" "${computeRegion}" ${deployModelId}`
    );
    assert.match(output, /Name:/);
  });

  it.skip(`should undeploy the model`, async () => {
    // Undeploy the model
    const output = await execSync(
      `node vision/object-detection/undeploy-model.v1beta1.js "${projectId}" "${computeRegion}" ${undeployModelId}`
    );
    assert.match(output, /Name:/);
  });
});
