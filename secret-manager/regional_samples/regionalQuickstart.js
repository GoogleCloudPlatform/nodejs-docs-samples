// Copyright 2024 Google LLC
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
  projectId = 'my-project', // Project for which to manage secrets.
  locationId = 'my-location', // Region location to store secrets in
  secretId = 'foo', // Secret ID.
  payload = 'hello world!' // String or buffer source data.
) {
  // [START secretmanager_regional_quickstart]

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Import the Secret Manager client and instantiate it:
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
  const client = new SecretManagerServiceClient(options);

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project', // Project for which to manage secrets.
  // locationID = 'my-location', // Region location to store secrets in
  // secretId = 'foo', // Secret ID.
  // payload = 'hello world!' // String source data.

  const parent = `projects/${projectId}/locations/${locationId}`;

  async function createAndAccessSecret() {
    // Create the secret.
    const [secret] = await client.createSecret({
      parent: parent,
      secret: {
        name: secretId,
      },
      secretId,
    });

    console.info(`Created regional secret ${secret.name}`);

    // Add a version with a payload onto the secret.
    const [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(payload, 'utf8'),
      },
    });

    console.info(`Added regional secret version ${version.name}`);

    // Access the secret.
    const [accessResponse] = await client.accessSecretVersion({
      name: version.name,
    });

    const responsePayload = accessResponse.payload.data.toString('utf8');
    console.info(`Payload: ${responsePayload}`);
  }
  createAndAccessSecret();
  // [END secretmanager_regional_quickstart]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
