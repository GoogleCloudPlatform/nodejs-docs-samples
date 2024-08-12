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

async function main(name, labelKey) {
  // [START secretmanager_delete_secret_label]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const name = 'projects/my-project/secrets/my-secret';
  // const labelKey = 'secretmanager';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function getSecret() {
    const [secret] = await client.getSecret({
      name: name,
    });

    return secret;
  }

  async function deleteSecretLabel() {
    const oldSecret = await getSecret();
    delete oldSecret.labels[labelKey];
    const [secret] = await client.updateSecret({
      secret: {
        name: name,
        labels: oldSecret.labels,
      },
      updateMask: {
        paths: ['labels'],
      },
    });

    console.info(`Updated secret ${secret.name}`);
  }

  deleteSecretLabel();
  // [END secretmanager_delete_secret_label]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
