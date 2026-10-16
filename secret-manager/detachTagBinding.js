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

async function main(name, tagValue) {
  // [START secretmanager_detach_tag_binding]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const name = 'projects/my-project/secrets/my-secret';
  // const tagValue = 'tagValues/123456789012';

  // Import the Resource Manager and Secret Manager libraries
  const {TagBindingsClient} = require('@google-cloud/resource-manager').v3;

  // Create the Resource Manager client
  const rmClient = new TagBindingsClient();

  // Build the resource name of the parent secret
  const parent = `//secretmanager.googleapis.com/${name}`;

  async function detachTag() {
    // Find the binding name for the given tag value
    let bindingName = null;
    const iterable = rmClient.listTagBindingsAsync(
      {
        parent: parent,
        pageSize: 50,
      },
      {autoPaginate: false}
    );

    for await (const binding of iterable) {
      if (binding.tagValue === tagValue) {
        bindingName = binding.name;
        break;
      }
    }

    if (bindingName === null) {
      console.log(`Tag binding for value ${tagValue} not found on ${name}.`);
      return;
    }

    // Delete the tag binding
    const [operation] = await rmClient.deleteTagBinding({
      name: bindingName,
    });

    // Wait for the operation to complete
    await operation.promise();
    console.log(`Detached tag value ${tagValue} from ${name}`);
  }

  detachTag();
  // [END secretmanager_detach_tag_binding]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
