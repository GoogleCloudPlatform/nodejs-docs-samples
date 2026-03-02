// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(
  projectId = 'YOUR_GCP_PROJECT_ID',
  computeRegion = 'REGION',
  modelId = 'YOUR_MODEL_ID',
  inputUri = 'gs://your-bucket-uri/file.csv',
  outputUriPrefix = 'gs://your-bucket-uri/OUTPUT_PREFIX/'
) {
  // [START automl_tables_batch_predict]

  /**
   * Demonstrates using the AutoML client to request prediction from
   * automl tables using GCS.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TBL4704590352927948800";
  // const inputUri = '[GCS_PATH]' e.g., "gs://<bucket-name>/<csv file>",
  // `The Google Cloud Storage URI containing the inputs`;
  // const outputUriPrefix = '[GCS_PATH]'
  // e.g., "gs://<bucket-name>/<folder-name>",
  // `The destination Google Cloud Storage URI for storing outputs`;

  const automl = require('@google-cloud/automl');

  // Create client for prediction service.
  const automlClient = new automl.v1beta1.PredictionServiceClient();

  // Get the full path of the model.
  const modelFullId = automlClient.modelPath(projectId, computeRegion, modelId);

  async function batchPredict() {
    // Construct request
    const inputConfig = {
      gcsSource: {
        inputUris: [inputUri],
      },
    };

    // Get the Google Cloud Storage output URI.
    const outputConfig = {
      gcsDestination: {
        outputUriPrefix: outputUriPrefix,
      },
    };

    const [, operation] = await automlClient.batchPredict({
      name: modelFullId,
      inputConfig: inputConfig,
      outputConfig: outputConfig,
    });

    // Get the latest state of long-running operation.
    console.log(`Operation name: ${operation.name}`);
    return operation;
  }

  batchPredict();
  // [END automl_tables_batch_predict]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
