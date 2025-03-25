/*
 * Copyright 2024 Google LLC
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
const {JobServiceClient} = require('@google-cloud/aiplatform');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Batch code predict', async () => {
  const displayName = `batch-code-predict-job-${uuid()}`;
  const location = 'us-central1';
  const inputUri =
    'gs://ucaip-samples-test-output/inputs/batch_predict_TCN/tcn_inputs.jsonl';
  const outputUri = 'gs://ucaip-samples-test-output/';
  const jobServiceClient = new JobServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });
  const projectId = process.env.CAIP_PROJECT_ID;
  let batchPredictionJobId;

  after(async () => {
    const name = jobServiceClient.batchPredictionJobPath(
      projectId,
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

  it('should create job with code prediction', async () => {
    const response = execSync(
      `node ./batch-code-predict.js ${projectId} ${inputUri} ${outputUri} ${displayName}`
    );

    assert.match(response, new RegExp(displayName));

    batchPredictionJobId = response
      .split('/locations/us-central1/batchPredictionJobs/')[1]
      .split('\n')[0];
  });
});
