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
 * existing parameter in the global location of the specified project
 * using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} parameterId - The ID of the parameter for which version details are to be rendered.
 * @param {string} parameterVersionId - The ID of the parameter version to be rendered.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  parameterVersionId = 'v1'
) {
  // [START parametermanager_render_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function renderParamVersion() {
    // Construct the parameter version name
    const name = client.parameterVersionPath(
      projectId,
      'global',
      parameterId,
      parameterVersionId
    );

    // Construct the request
    const request = {
      name: name,
    };

    // Render the parameter version
    const [parameterVersion] = await client.renderParameterVersion(request);
    console.log(`Rendered parameter version: ${parameterVersion.parameterVersion}`);

    // If the parameter contains secret references, they will be resolved
    // and the actual secret values will be included in the rendered output.
    // Be cautious with logging or displaying this information.
    console.log(
      'Rendered payload: ',
      parameterVersion.renderedPayload.toString('utf-8')
    );
    return parameterVersion;
  }

  return await renderParamVersion();
  // [END parametermanager_render_param_version]
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
