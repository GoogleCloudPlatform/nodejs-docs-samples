// Copyright 2026 Google LLC
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

async function main(projectId, secretId, locationId) {
  // [START secretmanager_update_regional_secret_expiration]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const secretId = 'my-secret';
  // const locationId = 'us-central1';

  // Construct the secret name from the component parts
  const name = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager server
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client with the regional endpoint
  const client = new SecretManagerServiceClient(options);

  async function updateRegionalSecretExpiration() {
    // Calculate new expiration time (2 hours from now)
    const newExpireTime = new Date();
    newExpireTime.setHours(newExpireTime.getHours() + 2);

    // Update the secret with the new expiration time
    const [secret] = await client.updateSecret({
      secret: {
        name: name,
        expireTime: {
          seconds: Math.floor(newExpireTime.getTime() / 1000),
          nanos: (newExpireTime.getTime() % 1000) * 1000000,
        },
      },
      updateMask: {
        paths: ['expire_time'],
      },
    });

    console.log(
      `Updated secret ${secret.name} expiration time to ${newExpireTime.toISOString()}`
    );
  }

  updateRegionalSecretExpiration();
  // [END secretmanager_update_regional_secret_expiration]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
