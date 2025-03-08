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
 * Creates a new version of an existing parameter in the specified region of the
 * specified project using the Google Cloud Parameter Manager SDK.
 * The payload is specified as a JSON format.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} locationId - The ID of the region where parameter is located.
 * @param {string} parameterId - The ID of the parameter for which the version is to be created.
 * @param {string} parameterVersionId - The ID of the parameter version to be created.
 * @param {Object} payload - The JSON data payload to be stored in the parameter version.
 */
async function main(
  projectId = 'my-project',
  locationId = 'us-central1',
  parameterId = 'my-parameter',
  parameterVersionId = 'v1',
  payload = {username: 'test-user', host: 'localhost'}
) {
  // [START parametermanager_create_structured_regional_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const locationId = 'us-central1';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';
  // const payload = {username: "test-user", host: "localhost"};

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function createStructuredRegionalParamVersion() {
    // Construct the parent resource name
    const parent = client.parameterPath(projectId, locationId, parameterId);

    // Construct the parameter version
    const parameterVersion = {
      payload: {
        data: Buffer.from(JSON.stringify(payload), 'utf8'),
      },
    };

    // Construct the request
    const request = {
      parent: parent,
      parameterVersionId: parameterVersionId,
      parameterVersion: parameterVersion,
    };

    // Create the regional parameter version
    const [response] = await client.createParameterVersion(request);
    console.log(`Created regional parameter version: ${response.name}`);
  }

  await createStructuredRegionalParamVersion();
  // [END parametermanager_create_structured_regional_param_version]
}

// Parse command line arguments
const args = process.argv.slice(2);
main(...args).catch(console.error);
