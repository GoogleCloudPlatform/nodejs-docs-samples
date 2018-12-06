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

// [START kms_list_keyrings]
async function listKeyRings(
  projectId = 'your-project-id' // Your GCP Project ID
) {
  // The location from which to list key rings, e.g. "global"
  const locationId = 'global';

  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // Lists key rings
  const parent = client.locationPath(projectId, locationId);
  const [keyRings] = await client.listKeyRings({parent});

  if (keyRings.length) {
    keyRings.forEach(keyRing => {
      console.log(`${keyRing.name}:`);
      console.log(`  Created: ${new Date(keyRing.createTime.seconds * 1000)}`);
    });
  } else {
    console.log('No key rings found.');
  }
}
// [END kms_list_keyrings]

const args = process.argv.slice(2);
listKeyRings(...args).catch(console.error);
