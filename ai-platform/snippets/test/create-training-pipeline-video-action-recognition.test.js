/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const {after, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const aiplatform = require('@google-cloud/aiplatform');
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

const pipelineServiceClient = new aiplatform.v1.PipelineServiceClient(
  clientOptions
);

const datasetId = '6881957627459272704';
const modelDisplayName = `temp_create_training_pipeline_node_var_model_test_${uuid()}`;
const trainingPipelineDisplayName = `temp_create_training_pipeline_node_var_test_${uuid()}`;
const location = 'us-central1';
const project = process.env.CAIP_PROJECT_ID;

let trainingPipelineId;

describe('AI platform create training pipeline video action recognition', async function () {
  this.retries(2);
  it('should create a new video action-recognition training pipeline', async () => {
    const stdout = execSync(
      `node ./create-training-pipeline-video-action-recognition.js ${datasetId} ${modelDisplayName} ${trainingPipelineDisplayName} ${project} ${location}`
    );
    assert.match(
      stdout,
      /Create training pipeline video action recognition response/
    );
    trainingPipelineId = stdout
      .split('/locations/us-central1/trainingPipelines/')[1]
      .split('\n')[0];
  });

  after('should cancel the training pipeline and delete it', async () => {
    const name = pipelineServiceClient.trainingPipelinePath(
      project,
      location,
      trainingPipelineId
    );

    const cancelRequest = {
      name,
    };

    pipelineServiceClient.cancelTrainingPipeline(cancelRequest).then(() => {
      const deleteRequest = {
        name,
      };

      return pipelineServiceClient.deleteTrainingPipeline(deleteRequest);
    });
  });
});
