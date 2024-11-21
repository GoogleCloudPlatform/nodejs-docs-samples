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

async function main(projectId, inputUri, outputUri, jobName) {
  // [START generativeaionvertexai_embedding_batch]
  // Imports the aiplatform library
  const aiplatformLib = require('@google-cloud/aiplatform');
  const aiplatform = aiplatformLib.protos.google.cloud.aiplatform.v1;

  /**
   * TODO(developer):  Uncomment/update these variables before running the sample.
   */
  // projectId = 'YOUR_PROJECT_ID';

  // Optional: URI of the input dataset.
  // Could be a BigQuery table or a Google Cloud Storage file.
  // E.g. "gs://[BUCKET]/[DATASET].jsonl" OR "bq://[PROJECT].[DATASET].[TABLE]"
  // inputUri =
  //   'gs://cloud-samples-data/generative-ai/embeddings/embeddings_input.jsonl';

  // Optional: URI where the output will be stored.
  // Could be a BigQuery table or a Google Cloud Storage file.
  // E.g. "gs://[BUCKET]/[OUTPUT].jsonl" OR "bq://[PROJECT].[DATASET].[TABLE]"
  // outputUri = 'gs://your_bucket/embedding_batch_output';

  // The name of the job
  // jobName = `Batch embedding job: ${new Date().getMilliseconds()}`;

  const textEmbeddingModel = 'text-embedding-005';
  const location = 'us-central1';

  // Configure the parent resource
  const parent = `projects/${projectId}/locations/${location}`;
  const modelName = `projects/${projectId}/locations/${location}/publishers/google/models/${textEmbeddingModel}`;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  };

  // Instantiates a client
  const jobServiceClient = new aiplatformLib.JobServiceClient(clientOptions);

  // Generates embeddings from text using batch processing.
  // Read more: https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/batch-prediction-genai-embeddings
  async function callBatchEmbedding() {
    const gcsSource = new aiplatform.GcsSource({
      uris: [inputUri],
    });

    const inputConfig = new aiplatform.BatchPredictionJob.InputConfig({
      gcsSource,
      instancesFormat: 'jsonl',
    });

    const gcsDestination = new aiplatform.GcsDestination({
      outputUriPrefix: outputUri,
    });

    const outputConfig = new aiplatform.BatchPredictionJob.OutputConfig({
      gcsDestination,
      predictionsFormat: 'jsonl',
    });

    const batchPredictionJob = new aiplatform.BatchPredictionJob({
      displayName: jobName,
      model: modelName,
      inputConfig,
      outputConfig,
    });

    const request = {
      parent,
      batchPredictionJob,
    };

    // Create batch prediction job request
    const [response] = await jobServiceClient.createBatchPredictionJob(request);

    console.log('Raw response: ', JSON.stringify(response, null, 2));
  }

  await callBatchEmbedding();
  // [END generativeaionvertexai_embedding_batch]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
