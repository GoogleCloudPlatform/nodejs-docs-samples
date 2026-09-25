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
  // [START secretmanager_create_regional_secret_with_cloud_sql_credentials]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  // Creates a new secret with the Cloud SQL DB credentials secret type. This
  // type is required to enable Secret Manager's automatic rotation of Cloud
  // SQL passwords. It can only be set when the secret is created, and the
  // secret's location must match the region of the target Cloud SQL
  // instance.
  async function createRegionalSecretWithCloudSqlCredentials() {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        secretType: 'CLOUD_SQL_DB_CREDENTIALS',
      },
    });

    console.log(`Created secret ${secret.name}`);

    // This built-in identity is what you grant Cloud SQL IAM permissions to,
    // so that Secret Manager can rotate the database password on its behalf.
    console.log(
      'Grant this identity Cloud SQL IAM permissions to enable rotation: ' +
        secret.policyMember.iamPolicyUidPrincipal
    );
  }

  createRegionalSecretWithCloudSqlCredentials();
  // [END secretmanager_create_regional_secret_with_cloud_sql_credentials]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
