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

async function main(projectId, locationId, secretId) {
  // [START secretmanager_list_regional_secret_tag_bindings]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const secretId = 'my-regional-secret';

  // Import the Resource Manager library
  const {TagBindingsClient} = require('@google-cloud/resource-manager').v3;

  // Set up the endpoint for the regional resource manager
  const rmEndpoint = `${locationId}-cloudresourcemanager.googleapis.com`;

  // Create the Tag Bindings client with the regional endpoint
  const tagBindingsClient = new TagBindingsClient({
    apiEndpoint: rmEndpoint,
  });

  // Build the resource name for the regional secret
  const name = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Format the parent resource for the tag bindings request
  const parent = `//secretmanager.googleapis.com/${name}`;

  async function listRegionalSecretTagBindings() {
    console.log(`Tag bindings for ${name}:`);
    let foundBindings = false;

    // List the tag bindings
    const iterable = tagBindingsClient.listTagBindingsAsync(
      {
        parent: parent,
        pageSize: 10,
      },
      {autoPaginate: false}
    );

    // Iterate through the results
    for await (const binding of iterable) {
      console.log(`- Tag Value: ${binding.tagValue}`);
      foundBindings = true;
    }

    if (!foundBindings) {
      console.log(`No tag bindings found for ${name}.`);
    }
  }

  listRegionalSecretTagBindings();
  // [END secretmanager_list_regional_secret_tag_bindings]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
