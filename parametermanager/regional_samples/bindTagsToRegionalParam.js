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
 * Creates a regional parameter and binds a tag value to it.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} parameterId - The ID to assign to the new parameter.
 * @param {string} tagValue - The tag value resource name, e.g. tagValues/1234567890.
 */
async function main(projectId, locationId, parameterId, tagValue) {
  // [START parametermanager_bind_tags_to_regional_param]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';
  // const tagValue = 'tagValues/1234567890';

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

  async function bindTagsToRegionalParam() {
    // Build the resource name of the parent location.
    const parent = client.locationPath(projectId, locationId);

    // Create the parameter.
    const [parameter] = await client.createParameter({
      parent: parent,
      parameterId: parameterId,
    });

    // Print the new parameter name.
    console.log(`Created regional parameter: ${parameter.name}`);

    // Build the request to bind the tag value to the new parameter.
    const request = {
      tagBinding: {
        parent: `//parametermanager.googleapis.com/${parameter.name}`,
        tagValue: tagValue,
      },
    };

    // Create the tag binding and wait for the operation to complete.
    const [operation] = await tagBindingsClient.createTagBinding(request);
    const [tagBinding] = await operation.promise();

    // Print the tag binding.
    console.log(`Created tag binding: ${tagBinding.name}`);
    return tagBinding;
  }

  return await bindTagsToRegionalParam();
  // [END parametermanager_bind_tags_to_regional_param]
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
