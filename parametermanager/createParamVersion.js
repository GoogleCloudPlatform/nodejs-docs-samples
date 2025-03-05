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
 * Creates a parameter version globally for unstructured data.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is to be created
 * @param {string} parameterId - The ID of the parameter for which the version is to be created.
 * @param {string} parameterVersionId - The ID of the parameter version to be created.
 * @param {string} payload - The unformatted string payload to be stored in the new parameter version.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  parameterVersionId = 'v1',
  payload = 'This is unstructured data'
) {
  // [START parametermanager_create_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';
  // const payload = 'This is unstructured data';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function createParamVersion() {
    // Construct the parent resource name
    const parent = client.parameterPath(projectId, 'global', parameterId);

    // Construct the parameter version
    const parameterVersion = {
      payload: {
        data: Buffer.from(payload, 'utf8'),
      },
    };

    // Construct the request
    const request = {
      parent: parent,
      parameterVersionId: parameterVersionId,
      parameterVersion: parameterVersion,
    };

    // Create the parameter version
    const [response] = await client.createParameterVersion(request);
    console.log(`Created parameter version: ${response.name}`);
  }

  await createParamVersion();
  // [END parametermanager_create_param_version]
}

// Parse command line arguments
const args = process.argv.slice(2);
main(...args).catch(console.error);
