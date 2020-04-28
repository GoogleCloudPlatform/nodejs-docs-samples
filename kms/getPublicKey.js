// Copyright 2019 Google LLC
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

// [START kms_get_public_key]
async function getPublicKey(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  cryptoKeyVersionId = '1' // Version of the crypto key to fetch
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  // Construct the crypto key version ID
  const name = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId,
    cryptoKeyVersionId
  );

  // Get public key from Cloud KMS
  const [publicKey] = await client.getPublicKey({name: name});

  // Return the public key pem
  return publicKey.pem;
}
// [END kms_get_public_key]

const args = process.argv.slice(2);
getPublicKey(...args).catch(console.error);
