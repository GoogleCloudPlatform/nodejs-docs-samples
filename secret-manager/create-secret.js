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

async function main(project = 'my-project', secretId = 'my-secret') {
  // [START secretmanager_sampleassistance_googlecloudsecretmanager_v1_secretmanagerserviceclient_createsecret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * (Not necessary if passing values as arguments)
   */
  // const project = 'YOUR_PROJECT_ID';
  // const secretId = 'YOUR_SECRET_ID';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager').v1;

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function createSecret() {
    // Configure the parent resource
    const parent = `projects/${project}`;
    const secret = {
      replication: {
        automatic: {},
      },
    }
    const request = {
      parent,
      secretId,
      secret,
    };

    const [response] = await client.createSecret(request);
    console.log(`Created Secret: ${response.name}`);
  }

  createSecret();
  // [END secretmanager_sampleassistance_googlecloudsecretmanager_v1_secretmanagerserviceclient_createsecret]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
