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
 * Creates a regional parameter with kms_key using the Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is to be created.
 * @param {string} locationId - The ID of the region where parameter is to be created.
 * @param {string} parameterId - The ID of the parameter to create. This ID must be unique within the project.
 * @param {string} kmsKey - The ID of the KMS key to be used for encryption.
 */
async function main(projectId, locationId, parameterId, kmsKey) {
  // [START parametermanager_create_regional_param_with_kms_key]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const locationId = 'YOUR_LOCATION_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const kmsKey = 'YOUR_KMS_KEY'

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function createRegionalParamWithKmsKey() {
    const parent = client.locationPath(projectId, locationId);
    const request = {
      parent: parent,
      parameterId: parameterId,
      parameter: {
        kmsKey: kmsKey,
      },
    };

    const [parameter] = await client.createParameter(request);
    console.log(
      `Created regional parameter ${parameter.name} with kms_key ${parameter.kmsKey}`
    );
    return parameter;
  }

  return await createRegionalParamWithKmsKey();
  // [END parametermanager_create_regional_param_with_kms_key]
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
