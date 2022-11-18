// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
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

const BATCH_PREDICT_REGION_TAG = 'beta/batch_predict';
const LOCATION = 'us-central1';
const MODEL_ID = 'TEN0000000000000000000';

describe('Automl Batch Predict Test', () => {
  const client = new AutoMlClient();

  it('should batch predict', async () => {
    // As batch prediction can take a long time, instead try to batch predict
    // on a nonexistent model and confirm that the model was not found, but
    // other elements of the request were valid.
    const projectId = await client.getProjectId();
    const inputUri = `gs://${projectId}-lcm/entity_extraction/input.jsonl`;
    const outputUri = `gs://${projectId}-lcm/TEST_BATCH_PREDICT/`;

    const args = [
      BATCH_PREDICT_REGION_TAG,
      projectId,
      LOCATION,
      MODEL_ID,
      inputUri,
      outputUri,
    ];
    const output = cp.spawnSync('node', args, {encoding: 'utf8'});

    assert.match(output.stderr, /does not exist/);
  });
});
