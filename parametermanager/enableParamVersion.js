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
 * Enables a specific version of a parameter in Google Cloud Parameter Manager.
 * This function demonstrates how to enable a parameter version by setting
 * its 'disabled' field to false using the Parameter Manager client library.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} parameterId - The ID of the parameter for which version is to be enabled.
 * @param {string} versionId - The version ID of the parameter to be enabled.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  versionId = 'v1'
) {
  // [START parametermanager_enable_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const parameterId = 'my-parameter';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function enableParamVersion() {
    // Construct the full resource name
    const name = client.parameterVersionPath(
      projectId,
      'global',
      parameterId,
      versionId
    );

    // Construct the request
    const request = {
      parameterVersion: {
        name: name,
        disabled: false,
      },
      updateMask: {
        paths: ['disabled'],
      },
    };

    // Make the API call to update the parameter version
    const [response] = await client.updateParameterVersion(request);

    console.log(
      `Enabled parameter version ${response.name} for parameter ${parameterId}`
    );
    return response;
  }

  await enableParamVersion();
  // [END parametermanager_enable_param_version]
}

// The command-line arguments are passed as an array to main().
const args = process.argv.slice(2);
main(...args).catch(console.error);
