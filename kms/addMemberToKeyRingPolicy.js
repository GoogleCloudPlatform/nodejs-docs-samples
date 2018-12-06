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

// [START kms_add_member_to_keyring_policy]
async function addMemberToKeyRingPolicy(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  member = 'user:dev@example.com', // Member to add to the crypto key
  role = 'roles/viewer' // Role to give the member
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the key ring, e.g. "global"
  const locationId = 'global';

  // Get the full path to the keyring
  const resource = client.keyRingPath(projectId, locationId, keyRingId);

  // Gets the IAM policy of a key ring
  let [policy] = await client.getIamPolicy({resource});
  policy.bindings = policy.bindings || [];

  // find the index of the binding matching the requested role
  const index = policy.bindings.findIndex(binding => binding.role === role);

  // Add the role/member combo to the policy
  const members = [];
  const binding = Object.assign({role}, {members}, policy.bindings[index]);
  if (index === -1) {
    policy.bindings.push(binding);
  }
  if (!binding.members.includes(member)) {
    binding.members.push(member);
  }

  // Adds the member/role combo to the policy of the key ring
  [policy] = await client.setIamPolicy({resource, policy});
  console.log(
    `${member}/${role} combo added to policy for key ring ${keyRingId}.`
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
    console.log(`Policy for key ring ${keyRingId} is empty.`);
  }
}
// [END kms_add_member_to_keyring_policy]

const args = process.argv.slice(2);
addMemberToKeyRingPolicy(...args).catch(console.error);
