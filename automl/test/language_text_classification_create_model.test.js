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

const CREATE_MODEL_REGION_TAG = 'language_text_classification_create_model';
const LOCATION = 'us-central1';
const DATASET_ID = 'TCN00000000000000000';

describe('Automl Natural Language Text Classification Create Model Test', () => {
  const client = new AutoMlClient();

  it('should create a model', async () => {
    const projectId = await client.getProjectId();
    const args = [CREATE_MODEL_REGION_TAG, projectId, LOCATION, DATASET_ID];
    const output = cp.spawnSync('node', args, {encoding: 'utf8'});

    assert.match(output.stderr, /NOT_FOUND/);
    assert.match(output.stderr, /Dataset does not exist./);
  });
});
