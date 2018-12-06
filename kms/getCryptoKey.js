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

// [START kms_get_cryptokey]
async function getCryptoKey(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key' // Name of the crypto key, e.g. "my-key"
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  // Gets a crypto key
  const [cryptoKey] = await client.getCryptoKey({name});
  console.log(`Name: ${cryptoKey.name}:`);
  console.log(`Created: ${new Date(cryptoKey.createTime)}`);
  console.log(`Purpose: ${cryptoKey.purpose}`);
  console.log(`Primary: ${cryptoKey.primary.name}`);
  console.log(`  State: ${cryptoKey.primary.state}`);
  console.log(`  Created: ${new Date(cryptoKey.primary.createTime)}`);
}
// [END kms_get_cryptokey]

const args = process.argv.slice(2);
getCryptoKey(...args).catch(console.error);
