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
  keyId = 'my-key'
) {
  // [START kms_iam_get_policy]
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

  async function iamGetPolicy() {
    const [policy] = await client.getIamPolicy({
      resource: resourceName,
    });

    for (const binding of policy.bindings) {
      console.log(`Role: ${binding.role}`);
      for (const member of binding.members) {
        console.log(`  - ${member}`);
      }
    }

    return policy;
  }

  return iamGetPolicy();
  // [END kms_iam_get_policy]
}
module.exports.main = main;

/* c8 ignore next 10 */
if (require.main === module) {
  main(...process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
