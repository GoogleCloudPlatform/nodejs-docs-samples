// Copyright 2020 Google LLC
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
const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const CREATE_MODEL_REGION_TAG = 'beta/video-object-tracking-create-model';
const LOCATION = 'us-central1';
const DATASET_ID = 'VOT9082518000266903552';

describe('Automl Video Object Tracking Create Model Test', () => {
  const client = new AutoMlClient();

  it.skip('should create a model', async () => {
    const projectId = await client.getProjectId();
    const create_output = execSync(
      `node ${CREATE_MODEL_REGION_TAG}.js ${projectId} ${LOCATION} ${DATASET_ID} video_test_create_model`
    );

    assert.match(create_output, /Training started/);
  });
});
