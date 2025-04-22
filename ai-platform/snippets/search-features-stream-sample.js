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
 * Searches Features matching a query in a given project using streaming.
 * See https://cloud.google.com/vertex-ai/docs/featurestore/setup before running
 * the code snippet
 */

'use strict';

async function main(
  project,
  query,
  location = 'us-central1',
  apiEndpoint = 'us-central1-aiplatform.googleapis.com',
  timeout = 300000
) {
  // [START aiplatform_search_features_stream_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const project = 'YOUR_PROJECT_ID';
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

  async function searchFeaturesStream() {
    // Configure the locationResource resource
    const locationResource = `projects/${project}/locations/${location}`;

    const request = {
      location: locationResource,
      query: query,
    };

    // Search Features stream request
    const streamObject = await featurestoreServiceClient.searchFeaturesStream(
      request,
      {
        timeout: Number(timeout),
      }
    );

    console.log('Search features stream response');
    console.log('Raw response:');
    streamObject.on('data', response => {
      console.log(JSON.stringify(response, null, 2));
    });

    streamObject.on('end', () => {
      console.log('No more data to read');
    });

    streamObject.on('close', () => {
      console.log('Stream object searchFeaturesStream is closed');
    });
  }
  searchFeaturesStream();
  // [END aiplatform_search_features_stream_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
