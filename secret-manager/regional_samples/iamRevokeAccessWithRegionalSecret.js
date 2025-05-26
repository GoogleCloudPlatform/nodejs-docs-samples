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

async function main(projectId, locationId, secretId, versionId, member) {
  // [START secretmanager_iam_revoke_access_with_regional_secret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';
  // const versionId = 'my-version';
  // const member = 'user:you@example.com';
  //
  // NOTE: Each member must be prefixed with its type. See the IAM documentation
  // for more information: https://cloud.google.com/iam/docs/overview.

  const name = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  async function grantAccessRegionalSecret() {
    // Get the current IAM policy.
    const [policy] = await client.getIamPolicy({
      resource: name,
    });

    // Build a new list of policy bindings with the user excluded.
    for (const i in policy.bindings) {
      const binding = policy.bindings[i];
      if (binding.role !== 'roles/secretmanager.secretAccessor') {
        continue;
      }

      const idx = binding.members.indexOf(member);
      if (idx !== -1) {
        binding.members.splice(idx, 1);
      }
    }

    // Save the updated IAM policy.
    await client.setIamPolicy({
      resource: name,
      policy: policy,
    });

    console.log(`Updated IAM policy for ${name}`);
  }

  grantAccessRegionalSecret();
  // [END secretmanager_iam_revoke_access_with_regional_secret]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
