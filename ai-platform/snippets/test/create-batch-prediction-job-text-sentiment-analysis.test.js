/*
 * Copyright 2021 Google LLC
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

const jobServiceClient = new aiplatform.v1.JobServiceClient(clientOptions);

const batchPredictionDisplayName = `temp_create_batch_prediction_text_sentiment_analysis_test${uuid()}`;
const modelId = '4792568875336073216';
const gcsSourceUri =
  'gs://ucaip-samples-test-output/inputs/batch_predict_TSN/tsn_inputs.jsonl';
const gcsDestinationOutputUriPrefix = 'gs://ucaip-samples-test-output/';
const location = 'us-central1';
const project = process.env.CAIP_PROJECT_ID;

let batchPredictionJobId;

// Training text objective TEXT_SENTIMENT is no longer supported.
describe.skip('AI platform create batch prediction job text sentiment analysis', () => {
  it('should create a text sentiment analysis batch prediction job', async () => {
    const stdout = execSync(
      `node ./create-batch-prediction-job-text-sentiment-analysis.js ${batchPredictionDisplayName} ${modelId} ${gcsSourceUri} ${gcsDestinationOutputUriPrefix} ${project} ${location}`
    );
    assert.match(
      stdout,
      /Create batch prediction job text sentiment analysis response/
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
