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

async function main(projectId, locationId, secretId, tagValue) {
  // [START secretmanager_bind_tags_to_regional_secret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';
  // const tagValue = 'tagValues/281476592621530';
  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
  const {TagBindingsClient} = require('@google-cloud/resource-manager').v3;

  // Adding the endpoint to call the regional
  const options = {};
  const bindingOptions = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;
  bindingOptions.apiEndpoint = `${locationId}-cloudresourcemanager.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);
  const resourcemanagerClient = new TagBindingsClient(bindingOptions);

  async function bindTagsToRegionalSecret() {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
    });

    console.log(`Created secret ${secret.name}`);

    const [operation] = await resourcemanagerClient.createTagBinding({
      tagBinding: {
        parent: `//secretmanager.googleapis.com/${secret.name}`,
        tagValue: tagValue,
      },
    });
    const [response] = await operation.promise();
    console.log('Created Tag Binding', response.name);
  }

  bindTagsToRegionalSecret();
  // [END secretmanager_bind_tags_to_regional_secret]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
