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
 * List all versions of an existing parameter in the specific region for the specified
 * project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} locationId - The ID of the region where the parameter is located.
 * @param {string} parameterId - The parameter ID for which versions are to be listed.
 */
async function main(
  projectId = 'my-project',
  locationId = 'us-central1',
  parameterId = 'my-parameter'
) {
  // [START parametermanager_list_regional_param_versions]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function listRegionalParamVersions() {
    // Construct the parent string for listing parameter versions in a specific region
    const parent = client.parameterPath(projectId, locationId, parameterId);

    const request = {
      parent: parent,
    };

    // Use listParameterVersionsAsync to handle pagination automatically
    const iterable = await client.listParameterVersionsAsync(request);

    for await (const version of iterable) {
      console.log(
        `Found regional parameter version ${version.name} with state ${version.disabled ? 'disabled' : 'enabled'} `
      );
    }
  }

  await listRegionalParamVersions();
  // [END parametermanager_list_regional_param_versions]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
