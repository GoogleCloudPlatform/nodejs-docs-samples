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

async function main(parent = 'projects/my-project/secrets/my-secret') {
  // [START secretmanager_add_secret_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project/secrets/my-secret';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  // Payload is the plaintext data to store in the secret
  const payload = Buffer.from('my super secret data', 'utf8');

  async function addSecretVersion() {
    const [version] = await client.addSecretVersion({
      parent: parent,
      payload: {
        data: payload,
      },
    });

    console.log(`Added secret version ${version.name}`);
  }

  addSecretVersion();
  // [END secretmanager_add_secret_version]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
