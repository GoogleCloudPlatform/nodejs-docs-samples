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

  // Enables managed rotation for a Cloud SQL DB credentials secret. This
  // links the secret to a Cloud SQL instance and database user, and can
  // only be called once per secret. It adds the secret's first version and
  // sets the matching password on the Cloud SQL user, taking the place of
  // a manually added secret version, which this secret type doesn't
  // support. Afterwards, use rotateRegionalSecret.js to trigger further
  // rotations.
  //
  // instanceId is the bare Cloud SQL instance ID (e.g. "my-instance") --
  // not a connection name. Neither the project nor the region should be
  // included: passing "PROJECT_ID:INSTANCE_ID" (as gcloud's own
  // `enable-managed-rotation --help` examples misleadingly show) or the
  // full "PROJECT_ID:LOCATION_ID:INSTANCE_ID" connection name both fail --
  // the service already knows the project from the secret's own path, and
  // prepends it internally, so a qualified value ends up double-prefixed.
  async function enableRegionalSecretManagedRotation() {
    // Leaving password unset lets Secret Manager generate a secure
    // password itself.
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
