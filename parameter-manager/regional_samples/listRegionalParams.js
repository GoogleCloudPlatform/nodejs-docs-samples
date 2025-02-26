// Copyright 2025 Google LLC
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

/**
 * Lists all parameters in the specified region for the specified
 * project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameters are located.
 * @param {string} locationId - The ID of the region where parameters are located.
 */
async function main(projectId = 'my-project', locationId = 'us-central1') {
  // [START parametermanager_list_regional_params]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function listRegionalParams() {
    // Construct the parent string for listing parameters in a specific region
    const parent = client.locationPath(projectId, locationId);

    const request = {
      parent: parent,
    };

    // Use listParametersAsync to handle pagination automatically
    const iterable = await client.listParametersAsync(request);

    console.log(`Parameters in ${locationId}:`);
    for await (const parameter of iterable) {
      console.log(
        `Found regional parameter ${parameter.name} with format ${parameter.format}`
      );
    }
  }

  await listRegionalParams();
  // [END parametermanager_list_regional_params]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
