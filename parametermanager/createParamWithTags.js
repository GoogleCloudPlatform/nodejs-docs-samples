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
 * Creates a parameter with a tag.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} parameterId - The ID to assign to the new parameter.
 * @param {string} tagKey - The tag key resource name, e.g. tagKeys/1234567890.
 * @param {string} tagValue - The tag value resource name, e.g. tagValues/1234567890.
 */
async function main(projectId, parameterId, tagKey, tagValue) {
  // [START parametermanager_create_param_with_tags]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const parameterId = 'my-parameter';
  // const tagKey = 'tagKeys/1234567890';
  // const tagValue = 'tagValues/1234567890';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function createParamWithTags() {
    // Build the resource name of the parent location.
    const parent = client.locationPath(projectId, 'global');

    // Build the request with the tag.
    const request = {
      parent: parent,
      parameterId: parameterId,
      parameter: {
        tags: {[tagKey]: tagValue},
      },
    };

    // Create the parameter.
    const [parameter] = await client.createParameter(request);

    // Print the newly created parameter name.
    console.log(
      `Created parameter ${parameter.name} with tag ${tagKey}: ${tagValue}`
    );
    return parameter;
  }

  return await createParamWithTags();
  // [END parametermanager_create_param_with_tags]
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
