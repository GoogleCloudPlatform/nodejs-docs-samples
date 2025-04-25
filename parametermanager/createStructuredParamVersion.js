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
 * Creates a new version of an existing parameter in the global location
 * of the specified project using the Google Cloud Parameter Manager SDK.
 * The payload is specified as a JSON format.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is to be created.
 * @param {string} parameterId - The ID of the parameter to create. This ID must be unique within the project.
 * @param {string} parameterVersionId - The ID of the parameter version to be created.
 * @param {Object} payload - The JSON payload data to be stored in the parameter version.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  parameterVersionId = 'v1',
  payload = {username: 'test-user', host: 'localhost'}
) {
  // [START parametermanager_create_structured_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';
  // const jsonData = {username: "test-user", host: "localhost"};

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function createStructuredParamVersion() {
    // Construct the parent resource name
    const parent = client.parameterPath(projectId, 'global', parameterId);

    // Construct the parameter version
    const parameterVersion = {
      payload: {
        data: Buffer.from(JSON.stringify(payload), 'utf8'),
      },
    };

    // Construct the request
    const request = {
      parent: parent,
      parameterVersionId: parameterVersionId,
      parameterVersion: parameterVersion,
    };

    // Create the parameter version
    const [paramVersion] = await client.createParameterVersion(request);
    console.log(`Created parameter version: ${paramVersion.name}`);
    return paramVersion;
  }

  return await createStructuredParamVersion();
  // [END parametermanager_create_structured_param_version]
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
