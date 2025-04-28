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

const path = require('path');
const {assert} = require('chai');
const {after, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const aiplatform = require('@google-cloud/aiplatform');
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

const pipelineServiceClient = new aiplatform.v1.PipelineServiceClient(
  clientOptions
);

const datasetId = '5148529167758786560';
const modelDisplayName = `temp_create_training_pipeline_sentiment_analysis_model_test${uuid()}`;
const trainingPipelineDisplayName = `temp_create_training_pipeline_sentiment_analysis_test_${uuid()}`;
const location = 'us-central1';
const project = process.env.CAIP_PROJECT_ID;

let trainingPipelineId;

// Training text objective TEXT_SENTIMENT is no longer supported.
describe.skip('AI platform create training pipeline text sentiment analysis', async function () {
  this.retries(2);
  it('should create a new text sentiment analysis training pipeline', async () => {
    const stdout = execSync(
      `node ./create-training-pipeline-text-sentiment-analysis.js \
                                            ${datasetId} \
                                            ${modelDisplayName} \
                                            ${trainingPipelineDisplayName} \
                                            ${project} ${location}`,
      {
        cwd,
      }
    );
    assert.match(
      stdout,
      /Create training pipeline text sentiment analysis response/
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
