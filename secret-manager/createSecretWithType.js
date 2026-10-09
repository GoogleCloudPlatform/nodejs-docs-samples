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

async function main(parent, secretId, secretType) {
  // [START secretmanager_create_secret_with_type]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';
  // const secretId = 'my-secret';
  // const secretType = 'ACCESS_KEY';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  // Creates a new secret with the given secret type.
  // Note: CLOUD_SQL_DB_CREDENTIALS is only supported in the regional secret.
  async function createSecretWithType() {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
        secretType: secretType,
      },
    });

    console.log(`Created secret with secret type: ${secret.name}`);
  }

  createSecretWithType();
  // [END secretmanager_create_secret_with_type]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
