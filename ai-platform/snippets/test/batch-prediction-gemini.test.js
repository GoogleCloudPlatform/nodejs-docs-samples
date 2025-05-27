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

import { assert } from 'chai';
import { after, describe, it } from 'mocha';
import { execSync as _execSync } from 'child_process';
import { JobServiceClient } from '@google-cloud/aiplatform';

const execSync = cmd => _execSync(cmd, {encoding: 'utf-8'});

describe('Batch predict with Gemini', async () => {
  const projectId = process.env.CAIP_PROJECT_ID;
  const outputGCSUri = 'gs://ucaip-samples-test-output/';
  const outputBqUri = `bq://${process.env.CAIP_PROJECT_ID}.gen_ai_batch_prediction.predictions_${Date.now()}`;
  const location = 'us-central1';

  const jobServiceClient = new JobServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });
  let batchPredictionGcsJobId;
  let batchPredictionBqJobId;

  after(async () => {
    let name = jobServiceClient.batchPredictionJobPath(
      projectId,
      location,
      batchPredictionGcsJobId
    );
    cancelAndDeleteJob(name);

    name = jobServiceClient.batchPredictionJobPath(
      projectId,
      location,
      batchPredictionBqJobId
    );
    cancelAndDeleteJob(name);

    function cancelAndDeleteJob(name) {
      const cancelRequest = {
        name,
      };

      jobServiceClient.cancelBatchPredictionJob(cancelRequest).then(() => {
        const deleteRequest = {
          name,
        };

        return jobServiceClient.deleteBatchPredictionJob(deleteRequest);
      });
    }
  });

  it('should create Batch prediction Gemini job with GCS ', async () => {
    const response = execSync(
      `node ./batch-prediction/batch-predict-gcs.js ${projectId} ${outputGCSUri}`
    );

    assert.match(response, new RegExp('/batchPredictionJobs/'));
    batchPredictionGcsJobId = response
      .split('/locations/us-central1/batchPredictionJobs/')[1]
      .split('\n')[0];
  }).timeout(100000);

  it('should create Batch prediction Gemini job with BigQuery', async () => {
    const response = execSync(
      `node ./batch-prediction/batch-predict-bq.js ${projectId} ${outputBqUri}`
    );

    assert.match(response, new RegExp('/batchPredictionJobs/'));
    batchPredictionBqJobId = response
      .split('/locations/us-central1/batchPredictionJobs/')[1]
      .split('\n')[0];
  }).timeout(100000);
});
