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

async function main(name = 'projects/my-project/secrets/my-secret') {
  // [START secretmanager_disable_secret_delayed_destroy]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const name = 'projects/my-project/secrets/my-secret';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function disableSecretDelayedDestroy() {
    const [secret] = await client.updateSecret({
      secret: {
        name: name,
      },
      updateMask: {
        paths: ['version_destroy_ttl'],
      },
    });

    console.info(`Disabled delayed destroy ${secret.name}`);
  }

  disableSecretDelayedDestroy();
  // [END secretmanager_disable_secret_delayed_destroy]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
