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
const {after, before, describe, it} = require('mocha');
const {AutoMlClient} = require('@google-cloud/automl').v1;
const {Storage} = require('@google-cloud/storage');

const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const BATCH_PREDICT_REGION_TAG = 'batch_predict';
const LOCATION = 'us-central1';
const MODEL_ID = 'TEN2238627664384491520';
const PREFIX = 'TEST_BATCH_PREDICT';

describe('Automl Batch Predict Test', () => {
  const client = new AutoMlClient();

  before('should verify the model is deployed', async () => {
    const projectId = await client.getProjectId();
    const request = {
      name: client.modelPath(projectId, LOCATION, MODEL_ID),
    };

    const [response] = await client.getModel(request);
    if (response.deploymentState === 'UNDEPLOYED') {
      const request = {
        name: client.modelPath(projectId, LOCATION, MODEL_ID),
      };

      const [operation] = await client.deployModel(request);

      // Wait for operation to complete.
      await operation.promise();
    }
  });

  it('should batch predict', async () => {
    const projectId = await client.getProjectId();
    const inputUri = `gs://${projectId}-lcm/entity_extraction/input.jsonl`;
    const outputUri = `gs://${projectId}-lcm/${PREFIX}/`;

    const batchPredictOutput = execSync(
      `node ${BATCH_PREDICT_REGION_TAG}.js ${projectId} ${LOCATION} ${MODEL_ID} ${inputUri} ${outputUri}`
    );
    assert.match(
      batchPredictOutput,
      /Batch Prediction results saved to Cloud Storage bucket/
    );
  });

  after('delete created files', async () => {
    const projectId = await client.getProjectId();
    const storageClient = new Storage();
    const options = {
      prefix: PREFIX,
    };
    const [files] = await storageClient
      .bucket(`gs://${projectId}-lcm`)
      .getFiles(options);
    files.forEach(file => {
      storageClient
        .bucket(`gs://${projectId}-lcm`)
        .file(file.name)
        .delete();
    });
  });
});
