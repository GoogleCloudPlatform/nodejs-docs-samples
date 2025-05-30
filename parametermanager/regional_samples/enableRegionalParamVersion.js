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
 * Enables a specific version of a regional parameter in Google Cloud Parameter Manager.
 * This function demonstrates how to enable a regional parameter version by setting
 * its 'disabled' field to false using the Parameter Manager client library.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} locationId - The ID of the region where parameter is located.
 * @param {string} parameterId - The ID of the parameter for which version is to be enabled.
 * @param {string} versionId - The version ID of the parameter to be enabled.
 */
async function main(projectId, locationId, parameterId, versionId) {
  // [START parametermanager_enable_regional_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function enableRegionalParamVersion() {
    // Construct the full resource name
    const name = client.parameterVersionPath(
      projectId,
      locationId,
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
    const [paramVersion] = await client.updateParameterVersion(request);

    console.log(
      `Enabled regional parameter version ${paramVersion.name} for parameter ${parameterId}`
    );
    return paramVersion;
  }

  return await enableRegionalParamVersion();
  // [END parametermanager_enable_regional_param_version]
}
module.exports.main = main;

/* c8 ignore next 10 */
if (require.main === module) {
  main(...process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
