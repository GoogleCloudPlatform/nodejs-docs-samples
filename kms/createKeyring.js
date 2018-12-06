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

// [START kms_create_keyring]
async function createKeyRing(
  projectId = 'YOUR_PROJECT_ID', // Your GCP projectId
  keyRingId = 'my-new-key-ring' // Name of the new key ring
) {
  // The location of the new key ring, e.g. "global"
  const locationId = 'global';

  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // Get the full path to the parent
  const parent = client.locationPath(projectId, locationId);

  // Creates a new key ring
  const [result] = await client.createKeyRing({parent, keyRingId});
  console.log(`Key ring ${result.name} created.`);
}
// [END kms_create_keyring]

const args = process.argv.slice(2);
createKeyRing(...args).catch(console.error);
