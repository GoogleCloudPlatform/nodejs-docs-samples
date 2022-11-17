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

const DELETE_MODEL_REGION_TAG = 'delete_model.js';
const LOCATION = 'us-central1';

describe('Automl Delete Model Tests', () => {
  const client = new AutoMlClient();

  it('should delete a model', async () => {
    // As model creation can take many hours, instead try to delete a
    // nonexistent model and confirm that the model was not found, but other
    // elements of the request were valid.
    const projectId = await client.getProjectId();
    const args = [
      DELETE_MODEL_REGION_TAG,
      projectId,
      LOCATION,
      'TRL0000000000000000000',
    ];
    const output = cp.spawnSync('node', args, {encoding: 'utf8'});

    assert.match(output.stderr, /NOT_FOUND/);
    assert.match(output.stderr, /The model does not exist./);
  });
});
