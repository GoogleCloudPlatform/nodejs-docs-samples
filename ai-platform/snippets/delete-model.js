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

async function main(modelId, project, location = 'us-central1') {
  // [START aiplatform_delete_model_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   */

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

  async function deleteModel() {
    // Configure the resource
    const name = modelServiceClient.modelPath(project, location, modelId);
    const request = {name};

    // Delete Model Request
    const [response] = await modelServiceClient.deleteModel(request);
    console.log(`Long running operation: ${response.name}`);

    // Wait for operation to complete
    await response.promise();
    const result = response.result;

    console.log('Delete model response:\n', result);
  }
  deleteModel();
  // [END aiplatform_delete_model_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
