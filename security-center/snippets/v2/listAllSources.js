// Copyright 2024 Google LLC
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

// Demonstrates how to list all security sources in an organization.
async function main() {
  // [START securitycenter_list_sources_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();

  // TODO(developer): Update the following for your own environment.
  const organizationId = '1081635000895';

  // Required. Resource name of the parent of sources to list. Its format should
  // be "organizations/[organization_id]", "folders/[folder_id]", or
  // "projects/[project_id]".
  const parent = `organizations/${organizationId}`;

  // Build the request.
  const listSourcesRequest = {
    parent,
  };

  async function listAllSources() {
    // Call the API.
    const iterable = client.listSourcesAsync(listSourcesRequest);
    let count = 0;
    console.log('Sources:');
    for await (const response of iterable) {
      console.log(`${++count} ${response.name} ${response.description}`);
    }
  }

  await listAllSources();
  // [END securitycenter_list_sources_v2]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
