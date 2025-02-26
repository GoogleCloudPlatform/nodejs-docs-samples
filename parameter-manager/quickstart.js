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

/**
 * This is a quickstart sample for the Google Cloud Parameter Manager.
 * It demonstrates how to create a parameter, create a parameter version,
 * view the parameter version, and render its payload.
 */

'use strict';

/**
 * Quickstart example for using Google Cloud Parameter Manager to
 * create a global parameter, add a version with a JSON payload,
 * and fetch the parameter version details.
 *
 * @param {string} projectId - The Google Cloud project ID where parameter is created.
 * @param {string} parameterId - The ID of the new parameter.
 * @param {string} parameterVersionId - The ID of the parameter version.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  parameterVersionId = 'v1'
) {
  // [START parametermanager_quickstart]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';

  // Imports the Google Cloud Parameter Manager library
  const {
    ParameterManagerClient,
    protos,
  } = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function quickstart() {
    const parent = client.locationPath(projectId, 'global');
    const parameterRequest = {
      parent: parent,
      parameterId: parameterId,
      parameter: {
        format: protos.google.cloud.parametermanager.v1.ParameterFormat.JSON,
      },
    };

    // Create a new parameter
    const [parameter] = await client.createParameter(parameterRequest);
    console.log(
      `Created parameter ${parameter.name} with format ${parameter.format}`
    );

    const payload = {username: 'test-user', host: 'localhost'};
    // Create a new parameter version
    const [parameterVersion] = await client.createParameterVersion({
      parent: parameter.name,
      parameterVersionId: parameterVersionId,
      parameterVersion: {
        payload: {
          data: Buffer.from(JSON.stringify(payload), 'utf8'),
        },
      },
    });
    console.log(`Created parameter version: ${parameterVersion.name}`);

    // Get the parameter version
    const [response] = await client.getParameterVersion({
      name: parameterVersion.name,
    });
    console.log(`Retrieved parameter version: ${response.name}`);
    console.log('Payload:', response.payload.data.toString('utf8'));
  }

  await quickstart();
  // [END parametermanager_quickstart]
}

// The command-line arguments are passed as an array to main()
const args = process.argv.slice(2);
main(...args).catch(console.error);
