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

async function main(parent = 'projects/my-project') {
  // [START secretmanager_list_secrets]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function listSecrets() {
    const [secrets] = await client.listSecrets({
      parent: parent,
    });

    secrets.forEach(secret => {
      const policy = secret.replication.userManaged
        ? secret.replication.userManaged
        : secret.replication.automatic;
      console.log(`${secret.name} (${policy})`);
    });
  }

  listSecrets();
  // [END secretmanager_list_secrets]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
