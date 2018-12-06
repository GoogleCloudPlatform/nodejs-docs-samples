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

// [START kms_remove_member_from_cryptokey_policy]
async function removeMemberFromCryptoKeyPolicy(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  member = 'user:dev@example.com', // Member to add to the crypto key
  role = 'roles/viewer' // Role to give the member
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  // Get the full path to the crypto key
  const resource = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  // Gets the IAM policy of a crypto key
  const [result] = await client.getIamPolicy({resource});
  let policy = Object.assign({bindings: []}, result);
  const index = policy.bindings.findIndex(binding => binding.role === role);
  const members = [];
  const binding = Object.assign({role, members}, policy.bindings[index]);
  if (index === -1) {
    return;
  }
  if (!binding.members.includes(member)) {
    return;
  }

  // Remove the role/member combo from the policy
  binding.members.splice(binding.members.indexOf(member), 1);

  const request = {resource, policy};
  console.log(JSON.stringify(request, null, 2));

  // Removes the member/role combo from the policy of the crypto key
  [policy] = await client.setIamPolicy(request);
  console.log(
    `${member}/${role} combo removed from policy for crypto key ${cryptoKeyId}.`
  );
  if (policy.bindings) {
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
// [END kms_remove_member_from_cryptokey_policy]

const args = process.argv.slice(2);
removeMemberFromCryptoKeyPolicy(...args).catch(console.error);
