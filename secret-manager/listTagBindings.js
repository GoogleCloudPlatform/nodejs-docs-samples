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
  // [START secretmanager_list_tag_bindings]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const name = 'projects/my-project/secrets/my-secret';

  // Import the Resource Manager and Secret Manager libraries
  const {TagBindingsClient} = require('@google-cloud/resource-manager').v3;

  // Create the Resource Manager client
  const client = new TagBindingsClient();

  // Build the resource name of the parent secret
  const parent = `//secretmanager.googleapis.com/${name}`;

  async function listTagBindings() {
    // List all tag bindings
    let foundBindings = false;

    // Use paginate to handle any pagination in the response
    const iterable = client.listTagBindingsAsync(
      {
        parent: parent,
        pageSize: 10,
      },
      {autoPaginate: false}
    );

    console.log(`Tag bindings for ${name}:`);

    for await (const binding of iterable) {
      console.log(`- Tag Value: ${binding.tagValue}`);
      foundBindings = true;
    }

    if (!foundBindings) {
      console.log(`No tag bindings found for ${name}.`);
    }
  }

  listTagBindings();
  // [END secretmanager_list_tag_bindings]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
