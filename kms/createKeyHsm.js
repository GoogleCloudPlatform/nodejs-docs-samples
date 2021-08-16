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
  keyRingId = 'my-key-ring',
  id = 'my-hsm-encryption-key'
) {
  // [START kms_create_key_hsm]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const id = 'my-hsm-encryption-key';

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the parent key ring name
  const keyRingName = client.keyRingPath(projectId, locationId, keyRingId);

  async function createKeyHsm() {
    const [key] = await client.createCryptoKey({
      parent: keyRingName,
      cryptoKeyId: id,
      cryptoKey: {
        purpose: 'ENCRYPT_DECRYPT',
        versionTemplate: {
          algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
          protectionLevel: 'HSM',
        },

        // Optional: customize how long key versions should be kept before
        // destroying.
        destroyScheduledDuration: {seconds: 60 * 60 * 24},
      },
    });

    console.log(`Created hsm key: ${key.name}`);
    return key;
  }

  return createKeyHsm();
  // [END kms_create_key_hsm]
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
