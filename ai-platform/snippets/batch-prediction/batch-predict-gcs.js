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

async function main(projectId, outputUri) {
  // [START generativeaionvertexai_batch_predict_gemini_createjob_gcs]
  // Import the aiplatform library
  const aiplatformLib = require('@google-cloud/aiplatform');
  const aiplatform = aiplatformLib.protos.google.cloud.aiplatform.v1;

  /**
   * TODO(developer):  Uncomment/update these variables before running the sample.
   */
  // projectId = 'YOUR_PROJECT_ID';
  // URI of the output folder in Google Cloud Storage.
  // E.g. "gs://[BUCKET]/[OUTPUT]"
  // outputUri = 'gs://my-bucket';

  // URI of the input file in Google Cloud Storage.
  // E.g. "gs://[BUCKET]/[DATASET].jsonl"
  // Or try:
  // "gs://cloud-samples-data/generative-ai/batch/gemini_multimodal_batch_predict.jsonl"
  // for a batch prediction that uses audio, video, and an image.
  const inputUri =
    'gs://cloud-samples-data/generative-ai/batch/batch_requests_for_multimodal_input.jsonl';
  const location = 'us-central1';
  const parent = `projects/${projectId}/locations/${location}`;
  const modelName = `${parent}/publishers/google/models/gemini-1.5-flash-002`;

  // Specify the location of the api endpoint.
  const clientOptions = {
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  };

  // Instantiate the client.
  const jobServiceClient = new aiplatformLib.JobServiceClient(clientOptions);

  // Create a Gemini batch prediction job using Google Cloud Storage input and output buckets.
  async function create_batch_prediction_gemini_gcs() {
    const gcsSource = new aiplatform.GcsSource({
      uris: [inputUri],
    });

    const inputConfig = new aiplatform.BatchPredictionJob.InputConfig({
      gcsSource: gcsSource,
      instancesFormat: 'jsonl',
    });

    const gcsDestination = new aiplatform.GcsDestination({
      outputUriPrefix: outputUri,
    });

    const outputConfig = new aiplatform.BatchPredictionJob.OutputConfig({
      gcsDestination: gcsDestination,
      predictionsFormat: 'jsonl',
    });

    const batchPredictionJob = new aiplatform.BatchPredictionJob({
      displayName: 'Batch predict with Gemini - GCS',
      model: modelName,
      inputConfig: inputConfig,
      outputConfig: outputConfig,
    });

    const request = {
      parent: parent,
      batchPredictionJob,
    };

    // Create batch prediction job request
    const [response] = await jobServiceClient.createBatchPredictionJob(request);
    console.log('Response name: ', response.name);
    // Example response:
    // Response name: projects/<project>/locations/us-central1/batchPredictionJobs/<job-id>
  }

  await create_batch_prediction_gemini_gcs();
  // [END generativeaionvertexai_batch_predict_gemini_createjob_gcs]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
