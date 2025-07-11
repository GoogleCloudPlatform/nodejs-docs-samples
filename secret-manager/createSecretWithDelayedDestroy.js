// Copyright 2025 Google LLC
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

async function main(parent, secretId, timeToLive) {
  // [START secretmanager_create_secret_with_delayed_destroy]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';
  // const secretId = 'my-secret';
  // const timeToLive = 86400;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function createSecretWithDelayedDestroy() {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
        version_destroy_ttl: {
          seconds: timeToLive,
        },
      },
    });

    console.log(`Created secret ${secret.name}`);
  }

  createSecretWithDelayedDestroy();
  // [END secretmanager_create_secret_with_delayed_destroy]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
