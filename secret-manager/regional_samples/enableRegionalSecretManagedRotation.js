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

async function main(projectId, locationId, secretId, instanceId, username) {
  // [START secretmanager_enable_regional_secret_managed_rotation]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';
  // const instanceId = 'my-cloud-sql-instance';
  // const username = 'my-db-user';

  const parent = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  // Enables managed rotation of a CLOUD_SQL_DB_CREDENTIALS typed secret.
  // It validates and enables the rotation, adding a version and sets the
  // passed password (optional).
  // Note: AddSecretVersion is disabled on the CLOUD_SQL_DB_CREDENTIALS
  // currently and for any necessary manual rotations please trigger
  // rotate_secret.
  async function enableRegionalSecretManagedRotation() {
    // Enable managed rotation.
    const [version] = await client.enableManagedRotation({
      parent: parent,
      cloudSqlSingleUserCredentials: {
        instanceId: instanceId,
        username: username,
      },
    });

    console.log(
      `Enabled managed rotation, created secret version: ${version.name}`
    );
  }

  enableRegionalSecretManagedRotation();
  // [END secretmanager_enable_regional_secret_managed_rotation]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
