// Copyright 2026 Google LLC
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
 * Gets the tag bindings of a regional parameter.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} parameterId - The ID of the parameter whose tags are retrieved.
 */
async function main(projectId, locationId, parameterId) {
  // [START parametermanager_get_regional_param_tags]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');
  const {TagBindingsClient} = require('@google-cloud/resource-manager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  // Instantiates a tag bindings client with regional endpoint
  const tagBindingsClient = new TagBindingsClient({
    apiEndpoint: `${locationId}-cloudresourcemanager.googleapis.com`,
  });

  async function getRegionalParamTags() {
    // Get the parameter.
    const name = client.parameterPath(projectId, locationId, parameterId);
    const [parameter] = await client.getParameter({name: name});

    // List the tag bindings of the parameter.
    const request = {
      parent: `//parametermanager.googleapis.com/${parameter.name}`,
    };
    const [bindings] = await tagBindingsClient.listTagBindings(request);

    // Print the tags of the parameter.
    for (const binding of bindings) {
      console.log(`Found regional parameter tag: ${binding.tagValue}`);
    }
    return bindings;
  }

  return await getRegionalParamTags();
  // [END parametermanager_get_regional_param_tags]
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
