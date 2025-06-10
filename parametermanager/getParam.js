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
 * Retrieves a parameter from the global location of the specified
 * project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} parameterId - The ID of the parameter to retrieve.
 */
async function main(projectId, parameterId) {
  // [START parametermanager_get_param]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const parameterId = 'my-parameter';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function getParam() {
    // Construct the fully qualified parameter name
    const name = client.parameterPath(projectId, 'global', parameterId);

    // Get the parameter
    const [parameter] = await client.getParameter({
      name: name,
    });

    // Find more details for the Parameter object here:
    // https://cloud.google.com/secret-manager/parameter-manager/docs/reference/rest/v1/projects.locations.parameters#Parameter
    console.log(
      `Found parameter ${parameter.name} with format ${parameter.format}`
    );
    return parameter;
  }

  return await getParam();
  // [END parametermanager_get_param]
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
