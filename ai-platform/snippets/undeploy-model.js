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
  deployedModelId,
  endpointId,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_undeploy_model_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const deployedModelId = "YOUR_MODEL_ID";
  // const endpointId = 'YOUR_ENDPOINT_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;
  // Imports the Google Cloud Endpoint Service Client library
  const {EndpointServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint:
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const endpointServiceClient = new EndpointServiceClient(clientOptions);

  async function undeployModel() {
    // Configure the parent resource
    const request = {
      deployedModelId,
      endpoint,
    };

    // Get and print out a list of all the endpoints for this resource
    const [response] = await endpointServiceClient.undeployModel(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    await response.promise();

    console.log('Undeploy model response');
    console.log(response);
  }
  undeployModel();
  // [END aiplatform_undeploy_model_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
