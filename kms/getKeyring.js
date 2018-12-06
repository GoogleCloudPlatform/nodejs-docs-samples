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

// [START kms_get_keyring]
async function getKeyRing(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring' // Name of the crypto key's key ring
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the key ring, e.g. "global"
  const locationId = 'global';

  // Get the full path to the keyring
  const name = client.keyRingPath(projectId, locationId, keyRingId);

  // Get the keyring
  const [keyRing] = await client.getKeyRing({name});
  console.log(`Name: ${keyRing.name}`);
  console.log(`Created: ${new Date(keyRing.createTime.seconds * 1000)}`);
}
// [END kms_get_keyring]

const args = process.argv.slice(2);
getKeyRing(...args).catch(console.error);
