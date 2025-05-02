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
 * Lists all parameters in the global location for the specified
 * project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameters are located.
 */
async function main(projectId) {
  // [START parametermanager_list_params]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function listParams() {
    // Construct the parent string for listing parameters globally
    const parent = client.locationPath(projectId, 'global');

    const request = {
      parent: parent,
    };

    // Use listParametersAsync to handle pagination automatically
    const parameters = await client.listParametersAsync(request);

    for await (const parameter of parameters) {
      console.log(
        `Found parameter ${parameter.name} with format ${parameter.format}`
      );
    }
    return parameters;
  }

  return await listParams();
  // [END parametermanager_list_params]
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
