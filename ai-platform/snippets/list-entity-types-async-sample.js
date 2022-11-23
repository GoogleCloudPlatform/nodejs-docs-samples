/*
 * Copyright 2022 Google LLC
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

/*
 * Lists EntityTypes Asynchronously in a given Featurestore.
 * See https://cloud.google.com/vertex-ai/docs/featurestore/setup before running
 * the code snippet
 */

'use strict';

async function main(
  project,
  featurestoreId,
  location = 'us-central1',
  apiEndpoint = 'us-central1-aiplatform.googleapis.com',
  timeout = 5000
) {
  // [START aiplatform_list_entity_types_async_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const project = 'YOUR_PROJECT_ID';
  // const featurestoreId = 'YOUR_FEATURESTORE_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  // const apiEndpoint = 'YOUR_API_ENDPOINT';
  // const timeout = <TIMEOUT_IN_MILLI_SECONDS>;

  // Imports the Google Cloud Featurestore Service Client library
  const {FeaturestoreServiceClient} = require('@google-cloud/aiplatform').v1;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: apiEndpoint,
  };

  // Instantiates a client
  const featurestoreServiceClient = new FeaturestoreServiceClient(
    clientOptions
  );

  async function listEntityTypesAsync() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}/featurestores/${featurestoreId}`;

    const request = {
      parent: parent,
    };

    // List EntityTypes Async request
    const iterable = await featurestoreServiceClient.listEntityTypesAsync(
      request,
      {timeout: Number(timeout)}
    );

    console.log('List entity types async response');
    console.log('Raw response:');
    for await (const response of iterable) {
      console.log(JSON.stringify(response, null, 2));
    }
  }
  listEntityTypesAsync();
  // [END aiplatform_list_entity_types_async_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
