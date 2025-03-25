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
const {after, before, describe, it} = require('mocha');
const uuid = require('uuid').v4;
const cp = require('child_process');
const {JobServiceClient} = require('@google-cloud/aiplatform');
const {Storage} = require('@google-cloud/storage');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Batch embedding', async () => {
  const displayName = `batch-embedding-job-${uuid()}`;
  const location = 'us-central1';
  const inputUri =
    'gs://cloud-samples-data/generative-ai/embeddings/embeddings_input.jsonl';
  let outputUri = 'gs://ucaip-samples-test-output/';
  const jobServiceClient = new JobServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });
  const projectId = process.env.CAIP_PROJECT_ID;
  const storage = new Storage({
    projectId,
  });
  let batchPredictionJobId;
  let bucket;

  before(async () => {
    const bucketName = `test-bucket-${uuid()}`;
    // Create a Google Cloud Storage bucket for embedding output
    [bucket] = await storage.createBucket(bucketName);
    outputUri = `gs://${bucketName}/embedding_batch_output`;
  });

  after(async () => {
    // Delete job
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
    // Delete the Google Cloud Storage bucket created for embedding output.
    await bucket.delete();
  });

  it('should create batch prediction job', async () => {
    const response = execSync(
      `node ./create-batch-embedding.js ${projectId} ${inputUri} ${outputUri} ${displayName}`
    );

    assert.match(response, new RegExp(displayName));
    batchPredictionJobId = response
      .split(`/locations/${location}/batchPredictionJobs/`)[1]
      .split('\n')[0];
  });
});
