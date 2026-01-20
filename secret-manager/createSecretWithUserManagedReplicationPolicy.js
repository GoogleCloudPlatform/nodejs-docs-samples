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

async function main(parent, secretId, locations, ttl = null) {
  // [START secretmanager_create_ummr_secret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';
  // const secretId = 'my-new-secret';
  // const locations = ['us-east1', 'europe-west1'];
  // const ttl = '7776000s'; // Optional: 90 days in seconds

  // Import the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Create the Secret Manager client
  const client = new SecretManagerServiceClient();

  async function createUmmrSecret() {
    // Create the secret configuration
    const secretConfig = {
      replication: {
        userManaged: {
          replicas: locations.map(location => ({location})),
        },
      },
      ttl: {
        seconds: ttl,
      },
    };

    // Create the secret
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: secretConfig,
    });

    console.log(`Created secret: ${secret.name}`);
  }

  createUmmrSecret();
  // [END secretmanager_create_ummr_secret]
}

const args = process.argv.slice(2);
const locations = args[2] ? args[2].split(',') : [];
main(args[0], args[1], locations, args[3]).catch(console.error);
