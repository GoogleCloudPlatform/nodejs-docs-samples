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

const MODEL_ID = 'TRL1218052175389786112';
const PREDICT_REGION_TAG = 'translate_predict';
const LOCATION = 'us-central1';

describe('Automl Translate Predict Test', () => {
  const client = new AutoMlClient();

  it('should predict', async () => {
    const projectId = await client.getProjectId();

    const list_output = execSync(
      `node ${PREDICT_REGION_TAG}.js ${projectId} ${LOCATION} ${MODEL_ID} resources/input.txt`
    );
    assert.match(list_output, /Translated content:/);
  });
});
