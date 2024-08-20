// Copyright 2019 Google LLC
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

async function main(projectId, locationId, secretId, version) {
  // [START secretmanager_access_regional_secret_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'location-id';
  // const secretId = 'my-secret'
  // const version = 'secret-version';

  const name = `projects/${projectId}/locations/${locationId}/secrets/${secretId}/versions/${version}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  async function accessRegionalSecretVersion() {
    const [version] = await client.accessSecretVersion({
      name: name,
    });

    // Extract the payload as a string.
    const payload = version.payload.data.toString();

    // WARNING: Do not print the secret in a production environment - this
    // snippet is showing how to access the secret material.
    console.info(`Payload: ${payload}`);
  }

  accessRegionalSecretVersion();
  // [END secretmanager_access_regional_secret_version]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
