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

// Demonstrates how to create a security source.
async function main() {
  // [START securitycenter_create_source_v2]
  // Import the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Create a new Security Center client
  const client = new SecurityCenterClient();

  // TODO(developer): Update for your own environment.
  const organizationId = '1081635000895';

  // Resource name of the new source's parent. Format is:
  // "organizations/[organization_id]".
  const parent = client.organizationPath(organizationId);

  // The source object.
  const source = {
    displayName: 'Customized Display Name V2',
    description: 'A new custom source that does X',
  };

  // Build the create source request.
  const createSourceRequest = {
    parent,
    source,
  };

  // The source is not visible in the Security Command Center dashboard
  // until it generates findings.
  // Call the API
  async function createSource() {
    const [source] = await client.createSource(createSourceRequest);
    console.log('New Source created: %j', source);
  }

  await createSource();
  // [END securitycenter_create_source_v2]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
