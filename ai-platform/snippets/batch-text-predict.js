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

async function main(projectId, inputUri, outputUri, jobDisplayName) {
  // [START generativeaionvertexai_batch_text_predict]
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
  //   'gs://cloud-samples-data/batch/prompt_for_batch_text_predict.jsonl';

  // Optional: URI where the output will be stored.
  // Could be a BigQuery table or a Google Cloud Storage file.
  // E.g. "gs://[BUCKET]/[OUTPUT].jsonl" OR "bq://[PROJECT].[DATASET].[TABLE]"
  // outputUri = 'gs://batch-bucket-testing/batch_text_predict_output';

  // The name of batch prediction job
  // jobDisplayName = `Batch text prediction job: ${new Date().getMilliseconds()}`;

  // The name of pre-trained model
  const textModel = 'text-bison';
  const location = 'us-central1';

  // Construct your modelParameters
  const parameters = {
    maxOutputTokens: '200',
    temperature: '0.2',
    topP: '0.95',
    topK: '40',
  };
  const parametersValue = aiplatformLib.helpers.toValue(parameters);
  // Configure the parent resource
  const parent = `projects/${projectId}/locations/${location}`;
  const modelName = `projects/${projectId}/locations/${location}/publishers/google/models/${textModel}`;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  };

  // Instantiates a client
  const jobServiceClient = new aiplatformLib.JobServiceClient(clientOptions);

  // Perform batch text prediction using a pre-trained text generation model.
  // Example of using Google Cloud Storage bucket as the input and output data source
  async function callBatchTextPredicton() {
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
      displayName: jobDisplayName,
      model: modelName,
      inputConfig,
      outputConfig,
      modelParameters: parametersValue,
    });

    const request = {
      parent,
      batchPredictionJob,
    };

    // Create batch prediction job request
    const [response] = await jobServiceClient.createBatchPredictionJob(request);

    console.log('Raw response: ', JSON.stringify(response, null, 2));
  }

  await callBatchTextPredicton();
  // [END generativeaionvertexai_batch_text_predict]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
