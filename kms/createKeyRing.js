// Copyright 2020 Google LLC
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

async function main(
  projectId = 'my-project',
  locationId = 'us-east1',
  id = 'my-key-ring'
) {
  // [START kms_create_key_ring]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-east1';
  // const id = 'my-key-ring';

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the parent location name
  const locationName = client.locationPath(projectId, locationId);

  async function createKeyRing() {
    const [keyRing] = await client.createKeyRing({
      parent: locationName,
      keyRingId: id,
    });

    console.log(`Created key ring: ${keyRing.name}`);
    return keyRing;
  }

  return createKeyRing();
  // [END kms_create_key_ring]
}
module.exports.main = main;

/* c8 ignore next 4 */
if (require.main === module) {
  const args = process.argv.slice(2);
  main(...args).catch(console.error);
}
