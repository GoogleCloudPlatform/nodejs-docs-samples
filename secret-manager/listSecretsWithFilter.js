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

async function main(projectId) {
  // [START secretmanager_list_secrets_with_filter]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  const filterStr = 'labels.secretmanager=rocks';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  // Build the resource name of the parent project
  const parent = `projects/${projectId}`;

  // List all secrets
  async function listSecretsWithFilter() {
    const [secrets] = await client.listSecrets({
      parent: parent,
      filter: filterStr,
    });

    // Print each secret
    for (const secret of secrets) {
      console.log(`Found secret: ${secret.name}`);
    }
  }

  listSecretsWithFilter();
  // [END secretmanager_list_secrets_with_filter]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
