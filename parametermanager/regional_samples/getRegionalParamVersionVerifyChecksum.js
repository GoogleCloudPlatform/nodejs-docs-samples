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
 * Gets a regional parameter version and verifies its payload checksum.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} parameterId - The ID of the parameter for which the version details are to be retrieved.
 * @param {string} versionId - The ID of the parameter version to be retrieved.
 */
async function main(projectId, locationId, parameterId, versionId) {
  // [START parametermanager_get_regional_param_version_verify_checksum]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');
  const crc32c = require('fast-crc32c');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function getRegionalParamVersionVerifyChecksum() {
    // Build the resource name of the parameter version.
    const name = client.parameterVersionPath(
      projectId,
      locationId,
      parameterId,
      versionId
    );

    // Get the parameter version with the payload and checksum (full view).
    const [parameterVersion] = await client.getParameterVersion({
      name: name,
      view: 'FULL',
    });

    // Verify the payload checksum.
    const computedCrc32c = crc32c.calculate(parameterVersion.payload.data);
    if (computedCrc32c !== Number(parameterVersion.payload.dataCrc32c)) {
      throw new Error(
        `Checksum mismatch for ${parameterVersion.name}: data corrupted`
      );
    }

    // Print the verification result and the checksum source.
    console.log(
      `Verified checksum for regional parameter version: ${parameterVersion.name}`
    );
    console.log(`Checksum source: ${parameterVersion.checksumSource}`);
    return parameterVersion;
  }

  return await getRegionalParamVersionVerifyChecksum();
  // [END parametermanager_get_regional_param_version_verify_checksum]
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
