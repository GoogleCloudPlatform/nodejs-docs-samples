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
const {describe, it} = require('mocha');
const {execSync} = require('child_process');

/** Tests for AutoML Video Intelligence Classification "Model API" sample. */

const cmdModel = 'node automlVideoIntelligenceModel.js';

// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the values of datasetId
//const projectId = process.env.PROJECT_ID;
//const computeRegion = process.env.REGION_NAME;
const filter = 'videoClassificationModelMetadata:*';
const datasetId = 'VCN1653190499151904768';
const testModelName = 'test_video_model';

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe.skip(`Video Intelligence ModelAPI`, () => {
  it(`should create a model`, async () => {
    // Create model
    let output = exec(
      `${cmdModel} create-model "${datasetId}" "${testModelName}"`
    );
    const operationName = output
      .split('\n')[0]
      .split(':')[1]
      .trim();
    assert.match(output, /Training started.../);

    output = exec(`${cmdModel} get-operation-status "${operationName}"`);
    assert.match(output, /Operation details:/);
  });

  it(`should list models, get and delete a model. list, get and display model
    evaluations from preexisting models`, async () => {
    // List models
    let output = exec(`${cmdModel} list-models "${filter}"`);
    const parsedOut = output.split('\n');
    const ouputModelId = parsedOut[3].split(':')[1].trim();
    assert.match(output, /List of models:/);

    // Get model
    output = exec(`${cmdModel} get-model "${ouputModelId}"`);
    assert.match(output, /Model name:/);

    // List model evaluations
    output = exec(`${cmdModel} list-model-evaluations "${ouputModelId}"`);
    const parsedModelEvaluation = output.split('\n');
    const modelEvaluationId = parsedModelEvaluation[3].split(':')[1].trim();
    assert.match(output, /Model evaluation Id:/);

    // Get model evaluation
    output = exec(
      `${cmdModel} get-model-evaluation "${ouputModelId}" ` +
        `"${modelEvaluationId}"`
    );
    assert.match(output, /Model evaluation Id:/);

    // Display evaluation
    output = exec(`${cmdModel} display-evaluation "${ouputModelId}"`);
    assert.match(output, /Model Evaluation ID:/);

    // Delete model
    output = exec(`${cmdModel} delete-model "${ouputModelId}"`);
    assert.match(output, /Model delete details:/);
  });

  it(`should list and get operation status`, async () => {
    // List operation status
    let output = exec(`${cmdModel} list-operations-status`);
    const operationFullId = output
      .split('\n')[3]
      .split(':')[1]
      .trim();
    assert.match(output, /Operation details:/);

    // Get operation status
    // Poll operation status, here confirming that operation is not complete yet
    output = exec(`${cmdModel} get-operation-status "${operationFullId}"`);
    assert.match(output, /Operation details:/);
  });
});
