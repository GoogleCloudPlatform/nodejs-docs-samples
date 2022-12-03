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
const {describe, it, before} = require('mocha');
const {AutoMlClient} = require('@google-cloud/automl').v1;

const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const PREDICT_REGION_TAG = 'language_sentiment_analysis_predict';
const LOCATION = 'us-central1';
const MODEL_ID = 'TST3171435737203605504';

describe('Automl Natural Language Sentiment Analysis Predict Test', () => {
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

  it('should predict', async () => {
    const projectId = await client.getProjectId();
    const content = "'Hopefully this Claritin kicks in soon'";

    const predictOutput = execSync(
      `node ${PREDICT_REGION_TAG}.js ${projectId} ${LOCATION} ${MODEL_ID} ${content}`
    );
    assert.match(predictOutput, /Predicted sentiment score/);
  });
});
