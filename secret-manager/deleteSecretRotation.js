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

async function main(name = 'projects/my-project/secrets/my-secret') {
  // [START secretmanager_delete_secret_rotation]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const name = 'projects/my-project/secrets/my-secret';

  // Import the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Create the Secret Manager client
  const client = new SecretManagerServiceClient();

  async function deleteSecretRotation() {
    // Update the secret with the rotation field removed
    const [secret] = await client.updateSecret({
      secret: {
        name: name,
      },
      updateMask: {
        paths: ['rotation'],
      },
    });

    console.log(`Removed rotation from secret ${secret.name}`);
  }

  deleteSecretRotation();
  // [END secretmanager_delete_secret_rotation]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
