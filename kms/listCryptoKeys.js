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

// [START kms_list_cryptokeys]
async function listCryptoKeys(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring' // Name of the crypto key's key ring
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the key ring from which to list crypto keys, e.g. "global"
  const locationId = 'global';

  const parent = client.keyRingPath(projectId, locationId, keyRingId);

  // Creates a new key ring
  const [cryptoKeys] = await client.listCryptoKeys({parent});
  if (cryptoKeys.length) {
    cryptoKeys.forEach(cryptoKey => {
      console.log(`${cryptoKey.name}:`);
      console.log(`  Created: ${new Date(cryptoKey.createTime)}`);
      console.log(`  Purpose: ${cryptoKey.purpose}`);
      console.log(`  Primary: ${cryptoKey.primary.name}`);
      console.log(`    State: ${cryptoKey.primary.state}`);
      console.log(`    Created: ${new Date(cryptoKey.primary.createTime)}`);
    });
  } else {
    console.log('No crypto keys found.');
  }
}
// [END kms_list_cryptokeys]

const args = process.argv.slice(2);
listCryptoKeys(...args).catch(console.error);
