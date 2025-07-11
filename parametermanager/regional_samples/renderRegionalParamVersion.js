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
 * Retrieves and renders the details of a specific version of an
 * existing parameter in the specified region of the specified project
 * using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} locationId - The ID of the region where parameter is located.
 * @param {string} parameterId - The ID of the parameter for which version details are to be rendered.
 * @param {string} parameterVersionId - The ID of the parameter version to be rendered.
 */
async function main(projectId, locationId, parameterId, parameterVersionId) {
  // [START parametermanager_render_regional_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const locationId = 'us-central1';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function renderRegionalParamVersion() {
    // Construct the parameter version name
    const name = client.parameterVersionPath(
      projectId,
      locationId,
      parameterId,
      parameterVersionId
    );

    // Construct the request
    const request = {
      name: name,
    };

    // Render the parameter version
    const [paramVersions] = await client.renderParameterVersion(request);

    console.log(
      `Rendered regional parameter version: ${paramVersions.parameterVersion}`
    );

    // If the parameter contains secret references, they will be resolved
    // and the actual secret values will be included in the rendered output.
    // Be cautious with logging or displaying this information.
    console.log(
      'Rendered payload: ',
      paramVersions.renderedPayload.toString('utf-8')
    );
    return paramVersions;
  }

  return await renderRegionalParamVersion();
  // [END parametermanager_render_regional_param_version]
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
