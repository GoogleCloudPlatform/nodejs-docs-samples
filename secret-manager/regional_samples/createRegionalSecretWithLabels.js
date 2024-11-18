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

async function main(projectId, locationId, secretId, labelKey, labelValue) {
  // [START secretmanager_create_regional_secret_with_labels]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const project = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';
  // const labelKey = 'secretmanager';
  // const labelValue = 'rocks';
  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  async function createRegionalSecretWithLabels() {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        labels: {
          [labelKey]: labelValue,
        },
      },
    });

    console.log(`Created secret ${secret.name}`);
  }

  createRegionalSecretWithLabels();
  // [END secretmanager_create_regional_secret_with_labels]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
