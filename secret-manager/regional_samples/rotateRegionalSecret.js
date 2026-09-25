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
  // [START secretmanager_rotate_regional_secret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';

  // Despite the field name, parent holds the full secret resource name, not
  // a collection parent.
  const parent = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  // Triggers a managed rotation for a Cloud SQL DB credentials secret.
  // Managed rotation must already be enabled on the secret (see
  // enableRegionalSecretManagedRotation.js). Each call generates a new
  // password, updates the Cloud SQL user, and adds the result as a new
  // secret version.
  async function rotateRegionalSecret() {
    const [version] = await client.rotateSecret({
      parent: parent,
    });

    console.log(`Rotated secret, created secret version: ${version.name}`);
  }

  rotateRegionalSecret();
  // [END secretmanager_rotate_regional_secret]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
