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

const jobServiceClient = new aiplatform.JobServiceClient(clientOptions);

const batchPredictionDisplayName = `temp_create_batch_prediction_video_classification_test${uuid()}`;
const modelId = '8596984660557299712';
const gcsSourceUri =
  'gs://ucaip-samples-test-output/inputs/vcn_40_batch_prediction_input.jsonl';
const gcsDestinationOutputUriPrefix = 'gs://ucaip-samples-test-output/';
const location = 'us-central1';
const project = process.env.CAIP_PROJECT_ID;

let batchPredictionJobId;

describe('AI platform create batch prediction job video classification', () => {
  it('should create a video classification batch prediction job', async () => {
    const stdout = execSync(
      `node ./create-batch-prediction-job-video-classification.js \
                                            ${batchPredictionDisplayName} \
                                            ${modelId} ${gcsSourceUri} \
                                            ${gcsDestinationOutputUriPrefix} \
                                            ${project} ${location}`,
      {
        cwd,
      }
    );
    assert.match(
      stdout,
      /Create batch prediction job video classification response/
    );
    batchPredictionJobId = stdout
      .split('/locations/us-central1/batchPredictionJobs/')[1]
      .split('\n')[0];
  });
  after('should cancel delete the batch prediction job', async () => {
    const name = jobServiceClient.batchPredictionJobPath(
      project,
      location,
      batchPredictionJobId
    );

    const cancelRequest = {
      name,
    };

    jobServiceClient.cancelBatchPredictionJob(cancelRequest).then(() => {
      const deleteRequest = {
        name,
      };

      return jobServiceClient.deleteBatchPredictionJob(deleteRequest);
    });
  });
});
