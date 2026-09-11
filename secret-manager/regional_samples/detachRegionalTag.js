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

async function main(projectId, locationId, secretId, tagValue) {
  // [START secretmanager_detach_regional_tag]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const secretId = 'my-secret';
  // const tagValue = 'tagValues/123456789012';

  // Import the Resource Manager library
  const {TagBindingsClient} = require('@google-cloud/resource-manager').v3;

  // Set up the endpoint for the regional resource manager
  const rmEndpoint = `${locationId}-cloudresourcemanager.googleapis.com`;

  // Create the Tag Bindings client with the regional endpoint
  const tagBindingsClient = new TagBindingsClient({
    apiEndpoint: rmEndpoint,
  });

  // Build the resource name for the regional secret
  const secretName = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Format the parent resource for the tag bindings request
  const parent = `//secretmanager.googleapis.com/${secretName}`;

  async function detachRegionalTag() {
    // Find the binding with the specified tag value
    let bindingName = null;
    const iterable = tagBindingsClient.listTagBindingsAsync(
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
      console.log(
        `Tag binding for value ${tagValue} not found on ${secretName}.`
      );
      return;
    }

    // Delete the tag binding
    const [operation] = await tagBindingsClient.deleteTagBinding({
      name: bindingName,
    });

    // Wait for the operation to complete
    await operation.promise();

    console.log(`Detached tag value ${tagValue} from ${secretName}`);
  }

  return detachRegionalTag();
  // [END secretmanager_detach_regional_tag]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
