// Copyright 2020 Google LLC
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

async function main(
  projectId = 'my-project',
  locationId = 'us-east1',
  keyRingId = 'my-key-ring',
  keyId = 'my-key',
  member = 'user:foo@example.com'
) {
  // [START kms_iam_add_member]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const keyId = 'my-key';
  // const member = 'user:foo@example.com';

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the resource name
  const resourceName = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    keyId
  );

  // The resource name could also be a key ring.
  // const resourceName = client.keyRingPath(projectId, locationId, keyRingId);

  async function iamAddMember() {
    // Get the current IAM policy.
    const [policy] = await client.getIamPolicy({
      resource: resourceName,
    });

    // Add the member to the policy.
    policy.bindings.push({
      role: 'roles/cloudkms.cryptoKeyEncrypterDecrypter',
      members: [member],
    });

    // Save the updated policy.
    const [updatedPolicy] = await client.setIamPolicy({
      resource: resourceName,
      policy: policy,
    });

    console.log('Updated policy');
    return updatedPolicy;
  }

  return iamAddMember();
  // [END kms_iam_add_member]
}
module.exports.main = main;

/* c8 ignore next 4 */
if (require.main === module) {
  const args = process.argv.slice(2);
  main(...args).catch(console.error);
}
