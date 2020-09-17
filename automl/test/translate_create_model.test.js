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
const {AutoMlClient} = require('@google-cloud/automl').v1;

const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const CREATE_MODEL_REGION_TAG = 'translate_create_model';
const LOCATION = 'us-central1';
const DATASET_ID = 'TRL8522556519449886720';

const {delay} = require('./util');

describe('Automl Translate Create Model Tests', () => {
  const client = new AutoMlClient();

  it.skip('should create a model', async function () {
    this.retries(5);
    await delay(this.test);

    const projectId = await client.getProjectId();
    const create_output = execSync(
      `node ${CREATE_MODEL_REGION_TAG}.js ${projectId} ${LOCATION} ${DATASET_ID} translation_test_create_model`
    );

    assert.match(create_output, /Training started/);
  });
});
