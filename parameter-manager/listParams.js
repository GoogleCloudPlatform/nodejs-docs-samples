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
async function main(projectId = 'my-project') {
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
    const iterable = await client.listParametersAsync(request);

    console.log('Parameters:');
    for await (const parameter of iterable) {
      console.log(
        `Found parameter ${parameter.name} with format ${parameter.format}`
      );
    }
  }

  await listParams();
  // [END parametermanager_list_params]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
