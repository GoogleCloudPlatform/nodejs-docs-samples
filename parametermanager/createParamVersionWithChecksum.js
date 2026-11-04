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
 * Creates a parameter version with a CRC32C checksum of the payload.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} parameterId - The ID of the parameter for which the version is to be created.
 * @param {string} versionId - The ID of the parameter version to be created.
 */
async function main(projectId, parameterId, versionId) {
  // [START parametermanager_create_param_version_with_checksum]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const parameterId = 'my-parameter';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');
  const crc32c = require('fast-crc32c');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function createParamVersionWithChecksum() {
    // Build the resource name of the parameter.
    const parent = client.parameterPath(projectId, 'global', parameterId);

    // Define the payload and compute its checksum.
    const payloadData = Buffer.from('hello world!', 'utf8');
    const dataCrc32c = crc32c.calculate(payloadData);

    // Build the request with the checksum.
    const request = {
      parent: parent,
      parameterVersionId: versionId,
      parameterVersion: {
        payload: {
          data: payloadData,
          dataCrc32c: dataCrc32c,
        },
      },
    };

    // Create the parameter version.
    const [parameterVersion] = await client.createParameterVersion(request);

    // Print the newly created parameter version name and checksum source.
    console.log(`Created parameter version: ${parameterVersion.name}`);
    console.log(`Checksum source: ${parameterVersion.checksumSource}`);
    return parameterVersion;
  }

  return await createParamVersionWithChecksum();
  // [END parametermanager_create_param_version_with_checksum]
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
