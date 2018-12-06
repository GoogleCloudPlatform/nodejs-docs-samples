// Copyright 2018 Google LLC
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

// [START kms_create_cryptokey]
async function createCryptoKey(
  projectId = 'your-project-id', // Your GCP Project Id
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key' // Name of the crypto key
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the new crypto key's key ring, e.g. "global"
  const locationId = 'global';

  const parent = client.keyRingPath(projectId, locationId, keyRingId);

  // Creates a new key ring
  const [cryptoKey] = await client.createCryptoKey({
    parent,
    cryptoKeyId,
    cryptoKey: {
      // This will allow the API access to the key for encryption and decryption
      purpose: 'ENCRYPT_DECRYPT',
    },
  });
  console.log(`Key ${cryptoKey.name} created.`);
}
// [END kms_create_cryptokey]

const args = process.argv.slice(2);
createCryptoKey(...args).catch(console.error);
