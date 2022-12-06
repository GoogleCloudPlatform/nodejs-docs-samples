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

async function main(endpointDisplayName, project, location = 'us-central1') {
  // [START aiplatform_create_endpoint_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const endpointDisplayName = 'YOUR_ENDPOINT_DISPLAY_NAME';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Endpoint Service Client library
  const {EndpointServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const endpointServiceClient = new EndpointServiceClient(clientOptions);

  async function createEndpoint() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    const endpoint = {
      displayName: endpointDisplayName,
    };
    const request = {
      parent,
      endpoint,
    };

    // Get and print out a list of all the endpoints for this resource
    const [response] = await endpointServiceClient.createEndpoint(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    await response.promise();
    const result = response.result;

    console.log('Create endpoint response');
    console.log(`\tName : ${result.name}`);
    console.log(`\tDisplay name : ${result.displayName}`);
    console.log(`\tDescription : ${result.description}`);
    console.log(`\tLabels : ${JSON.stringify(result.labels)}`);
    console.log(`\tCreate time : ${JSON.stringify(result.createTime)}`);
    console.log(`\tUpdate time : ${JSON.stringify(result.updateTime)}`);
  }
  createEndpoint();
  // [END aiplatform_create_endpoint_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
