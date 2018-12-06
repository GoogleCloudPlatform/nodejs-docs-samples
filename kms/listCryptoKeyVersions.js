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

// [START kms_list_cryptokey_versions]
async function listCryptoKeyVersions(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // name of the crypto key's key ring
  cryptoKeyId = 'my-key-ring' // name of the crypto key from which to list versions
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  // Get full path to crypto key
  const parent = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  // Creates a new key ring
  const [versions] = await client.listCryptoKeyVersions({parent});
  if (versions.length) {
    versions.forEach(version => {
      console.log(`${version.name}:`);
      console.log(`  Created: ${new Date(version.createTime.seconds * 1000)}`);
      console.log(`  State: ${version.state}`);
    });
  } else {
    console.log('No crypto key versions found.');
  }
}
// [END kms_list_cryptokey_versions]

const args = process.argv.slice(2);
listCryptoKeyVersions(...args).catch(console.error);
