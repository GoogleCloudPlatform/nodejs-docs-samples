// Copyright 2020 Google LLC
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
const {AutoMlClient} = require('@google-cloud/automl').v1;

const cp = require('child_process');

const DEPLOY_MODEL_REGION_TAG =
  'vision_classification_deploy_model_node_count.js';
const LOCATION = 'us-central1';
const MODEL_ID = 'ICN0000000000000000000';

describe('Automl Vision Classification Deploy Model Test', () => {
  const client = new AutoMlClient();

  it('should deploy a model with a specified node count', async () => {
    // As model deployment can take a long time, instead try to deploy a
    // nonexistent model and confirm that the model was not found, but other
    // elements of the request were valid.
    const projectId = await client.getProjectId();
    const args = [DEPLOY_MODEL_REGION_TAG, projectId, LOCATION, MODEL_ID];
    const output = cp.spawnSync('node', args, {encoding: 'utf8'});

    assert.match(output.stderr, /NOT_FOUND/);
    assert.match(output.stderr, /The model does not exist./);
  });
});
