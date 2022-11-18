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
  gcsDestinationOutputUriPrefix,
  modelId,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_export_model_tabular_classification_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const gcsDestinationOutputUriPrefix ='YOUR_GCS_DESTINATION_\
  // OUTPUT_URI_PREFIX'; eg. "gs://<your-gcs-bucket>/destination_path"
  // const modelId = 'YOUR_MODEL_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Model Service Client library
  const {ModelServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const modelServiceClient = new ModelServiceClient(clientOptions);

  async function exportModelTabularClassification() {
    // Configure the name resources
    const name = `projects/${project}/locations/${location}/models/${modelId}`;
    // Configure the outputConfig resources
    const outputConfig = {
      exportFormatId: 'tf-saved-model',
      artifactDestination: {
        outputUriPrefix: gcsDestinationOutputUriPrefix,
      },
    };
    const request = {
      name,
      outputConfig,
    };

    // Export Model request
    const [response] = await modelServiceClient.exportModel(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    await response.promise();
    console.log(`Export model response : ${JSON.stringify(response.result)}`);
  }
  exportModelTabularClassification();
  // [END aiplatform_export_model_tabular_classification_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
