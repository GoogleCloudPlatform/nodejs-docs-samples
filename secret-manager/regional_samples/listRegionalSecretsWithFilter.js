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

async function main(projectId, locationId) {
  // [START secretmanager_list_regional_secrets_with_filter]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  const filterStr = 'labels.secretmanager=rocks';

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  async function listRegionalSecretsWithFilter() {
    const [secrets] = await client.listSecrets({
      parent: parent,
      filter: filterStr,
    });

    secrets.forEach(secret => {
      console.log(`Found secret: ${secret.name}`);
    });
  }

  listRegionalSecretsWithFilter();
  // [END secretmanager_list_regional_secrets_with_filter]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
