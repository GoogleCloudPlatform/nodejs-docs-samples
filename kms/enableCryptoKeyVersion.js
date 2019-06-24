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

// [START kms_enable_cryptokey_version]
async function enableCryptoKeyVersion(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key version's key ring
  cryptoKeyId = 'my-key', // Name of the version's crypto key
  version = 1234 // The version's id
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key versions's key ring, e.g. "global"
  const locationId = 'global';

  // Get the full path to the crypto key
  const name = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId,
    version
  );

  // Gets a crypto key version
  const [cryptoKeyVersion] = await client.getCryptoKeyVersion({name});

  // enables a crypto key version
  const [result] = await client.updateCryptoKeyVersion({
    cryptoKeyVersion: {state: 'ENABLED', name: cryptoKeyVersion.name},
    updateMask: ['state'],
  });
  console.log(`Crypto key version ${result.name} enabled.`);
}
// [END kms_enable_cryptokey_version]

const args = process.argv.slice(2);
enableCryptoKeyVersion(...args).catch(console.error);
