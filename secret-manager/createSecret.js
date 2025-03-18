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

async function main(
  parent = 'projects/my-project',
  secretId = 'my-secret',
  ttl = undefined
) {
  // [START secretmanager_create_secret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';
  // const secretId = 'my-secret';
  // const ttl = undefined // Optional: Specify TTL in seconds (e.g., '900s' for 15 minutes).

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function createSecret() {
    const secretConfig = {
      replication: {
        automatic: {},
      },
    };

    // Add TTL to the secret configuration if provided
    if (ttl) {
      secretConfig.ttl = {
        seconds: parseInt(ttl.replace('s', ''), 10),
      };
      console.log(`Secret TTL set to ${ttl}`);
    }

    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: secretConfig,
    });

    console.log(`Created secret ${secret.name}`);
  }

  createSecret();
  // [END secretmanager_create_secret]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
