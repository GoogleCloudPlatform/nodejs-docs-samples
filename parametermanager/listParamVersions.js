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
 *
 * Lists all versions of an existing parameter in the global location
 * of the specified project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where parameter is located.
 * @param {string} parameterId - The parameter ID for which versions are to be listed.
 */
async function main(projectId, parameterId) {
  // [START parametermanager_list_param_versions]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const parameterId = 'my-parameter';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function listParamVersions() {
    // Construct the parent string for listing parameter versions globally
    const parent = client.parameterPath(projectId, 'global', parameterId);

    const request = {
      parent: parent,
    };

    // Use listParameterVersionsAsync to handle pagination automatically
    const parameterVersions = await client.listParameterVersionsAsync(request);

    for await (const version of parameterVersions) {
      console.log(
        `Found parameter version ${version.name} with state ${version.disabled ? 'disabled' : 'enabled'}`
      );
    }
    return parameterVersions;
  }

  return await listParamVersions();
  // [END parametermanager_list_param_versions]
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
