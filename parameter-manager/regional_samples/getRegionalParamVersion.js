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
 * Retrieves the details of a specific version of an existing parameter in the specified region of the specified
 * project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} locationId - The ID of the region where parameter is located.
 * @param {string} parameterId - The ID of the parameter for which version details are to be retrieved.
 * @param {string} versionId - The version ID of the parameter to retrieve.
 */
async function main(
  projectId = 'my-project',
  locationId = 'us-central1',
  parameterId = 'my-parameter',
  versionId = 'v1'
) {
  // [START parametermanager_get_regional_param_version]
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

  async function getRegionalParamVersion() {
    // Construct the fully qualified parameter version name
    const name = client.parameterVersionPath(
      projectId,
      locationId,
      parameterId,
      versionId
    );

    // Get the parameter version
    const [parameterVersion] = await client.getParameterVersion({
      name: name,
    });

    // Find more details for the Parameter Version object here:
    // https://cloud.google.com/secret-manager/parameter-manager/docs/reference/rest/v1/projects.locations.parameters.versions#ParameterVersion
    console.log(
      `Found regional parameter version ${parameterVersion.name} with state ${parameterVersion.disabled ? 'disabled' : 'enabled'}`
    );
    if (!parameterVersion.disabled) {
      console.log(
        `Payload: ${parameterVersion.payload.data.toString('utf-8')}`
      );
    }
  }

  await getRegionalParamVersion();
  // [END parametermanager_get_regional_param_version]
}

// The command-line arguments are passed as an array to main()
const args = process.argv.slice(2);
main(...args).catch(console.error);
