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
 * Quickstart example for using Google Cloud Parameter Manager to
 * create a regional parameter, add a version with a JSON payload,
 * fetch the parameter version details and render its payload.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is to be created.
 * @param {string} locationId - The ID of the region where parameter is to be created.
 * @param {string} parameterId - The ID of the parameter to create.
 * @param {string} parameterVersionId - The ID of the parameter version to create.
 */
async function main(projectId, locationId, parameterId, parameterVersionId) {
  // [START parametermanager_regional_quickstart]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';
  // const parameterVersionId = 'v1';

  // Imports the Google Cloud Parameter Manager library
  const {
    ParameterManagerClient,
    protos,
  } = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function regionalQuickstart() {
    const parent = client.locationPath(projectId, locationId);
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
      `Created regional parameter ${parameter.name} with format ${parameter.format}`
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
    console.log(`Created regional parameter version: ${parameterVersion.name}`);

    // Get the parameter version
    const [paramVersion] = await client.getParameterVersion({
      name: parameterVersion.name,
    });
    console.log(`Retrieved regional parameter version: ${paramVersion.name}`);
    console.log('Payload:', paramVersion.payload.data.toString('utf8'));
    return paramVersion;
  }

  return await regionalQuickstart();
  // [END parametermanager_regional_quickstart]
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
