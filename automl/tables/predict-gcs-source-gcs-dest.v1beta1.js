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
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  modelId = 'MODEL_ID',
  inputUri = 'GCS_PATH',
  outputUriPrefix = 'GCS_DIRECTORY'
) {
  // [START automl_tables_predict_using_gcs_source_and_gcs_dest]
  const automl = require('@google-cloud/automl');

  // Create client for prediction service.
  const client = new automl.v1beta1.PredictionServiceClient();

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

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Get the multiple Google Cloud Storage input URIs.
  const inputUris = inputUri.split(',');
  const inputConfig = {
    gcsSource: {
      inputUris: inputUris,
    },
  };

  // Get the Google Cloud Storage output URI.
  const outputConfig = {
    gcsDestination: {
      outputUriPrefix: outputUriPrefix,
    },
  };

  // Get the latest state of long-running operation.
  client
    .batchPredict({
      name: modelFullId,
      inputConfig: inputConfig,
      outputConfig: outputConfig,
    })
    .then(responses => {
      const operation = responses[1];
      console.log(`Operation name: ${operation.name}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_predict_using_gcs_source_and_gcs_dest]
}
main(...process.argv.slice(2)).catch(console.error());
