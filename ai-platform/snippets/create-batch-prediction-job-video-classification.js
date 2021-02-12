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

async function main(
  batchPredictionDisplayName,
  modelId,
  gcsSourceUri,
  gcsDestinationOutputUriPrefix,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_batch_prediction_job_video_classification]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const batchPredictionDisplayName = 'YOUR_BATCH_PREDICTION_DISPLAY_NAME';
  // const modelId = 'YOUR_MODEL_ID';
  // const gcsSourceUri = 'YOUR_GCS_SOURCE_URI';
  // const gcsDestinationOutputUriPrefix = 'YOUR_GCS_DEST_OUTPUT_URI_PREFIX';
  //    eg. "gs://<your-gcs-bucket>/destination_path"
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  const aiplatform = require('@google-cloud/aiplatform');
  const {params} = aiplatform.protos.google.cloud.aiplatform.v1.schema.predict;

  // Imports the Google Cloud Job Service Client library
  const {JobServiceClient} = require('@google-cloud/aiplatform').v1;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const jobServiceClient = new JobServiceClient(clientOptions);

  async function createBatchPredictionJobVideoClassification() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    const modelName = `projects/${project}/locations/${location}/models/${modelId}`;

    // For more information on how to configure the model parameters object, see
    // https://cloud.google.com/ai-platform-unified/docs/predictions/batch-predictions
    const modelParamsObj = new params.VideoClassificationPredictionParams({
      confidenceThreshold: 0.5,
      maxPredictions: 1000,
      segmentClassification: true,
      shotClassification: true,
      oneSecIntervalClassification: true,
    });

    const modelParameters = modelParamsObj.toValue();

    const inputConfig = {
      instancesFormat: 'jsonl',
      gcsSource: {uris: [gcsSourceUri]},
    };
    const outputConfig = {
      predictionsFormat: 'jsonl',
      gcsDestination: {outputUriPrefix: gcsDestinationOutputUriPrefix},
    };
    const batchPredictionJob = {
      displayName: batchPredictionDisplayName,
      model: modelName,
      modelParameters,
      inputConfig,
      outputConfig,
    };
    const request = {
      parent,
      batchPredictionJob,
    };

    // Create batch prediction job request
    const [response] = await jobServiceClient.createBatchPredictionJob(request);

    console.log('Create batch prediction job video classification response');
    console.log(`Name : ${response.name}`);
    console.log('Raw response:');
    console.log(JSON.stringify(response, null, 2));
  }
  createBatchPredictionJobVideoClassification();
  // [END aiplatform_create_batch_prediction_job_video_classification]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
