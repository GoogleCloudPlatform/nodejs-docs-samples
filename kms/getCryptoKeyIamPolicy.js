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

// [START kms_get_cryptokey_policy]
async function getCryptoKeyIamPolicy(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key' // Name of the crypto key, e.g. "my-key"
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  const resource = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  // Gets the IAM policy of a crypto key
  const [policy] = await client.getIamPolicy({resource});
  if (policy.bindings && policy.bindings.length > 0) {
    policy.bindings.forEach(binding => {
      if (binding.members && binding.members.length) {
        console.log(`${binding.role}:`);
        binding.members.forEach(member => {
          console.log(`  ${member}`);
        });
      }
    });
  } else {
    console.log(`Policy for crypto key ${cryptoKeyId} is empty.`);
  }
}
// [END kms_get_cryptokey_policy]

const args = process.argv.slice(2);
getCryptoKeyIamPolicy(...args).catch(console.error);
