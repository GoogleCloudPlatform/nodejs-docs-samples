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

async function main(projectId, locationId, secretId) {
  // [START secretmanager_create_regional_secret_with_expire_time]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const project = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';

  const parent = `projects/${projectId}/locations/${locationId}`;
  // Import the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager server
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  async function createRegionalSecretWithExpiration() {
    // Calculate expiration time (1 hour from now)
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    // Create the secret with automatic replication and expiration time
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        expireTime: {
          seconds: Math.floor(expireTime.getTime() / 1000),
          nanos: (expireTime.getTime() % 1000) * 1000000,
        },
      },
    });

    console.log(
      `Created secret ${secret.name} with expiration time ${expireTime.toISOString()}`
    );
  }

  createRegionalSecretWithExpiration();
}
// [END secretmanager_create_regional_secret_with_expire_time]

const args = process.argv.slice(2);
main(...args).catch(console.error);
