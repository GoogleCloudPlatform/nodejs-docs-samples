/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Demonstrates how to retrieve a specific source.
 */
function main(organizationId, sourceId) {
  // [START securitycenter_get_source_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

  /**
   *  Required. Relative resource name of the source. Its format is
   *  "organizations/[organization_id]/source/[source_id]".
   */
  const name = `organizations/${organizationId}/sources/${sourceId}`;

  // Build the request.
  const getSourceRequest = {
    name,
  };

  async function getSource() {
    // Call the API.
    const [source] = await client.getSource(getSourceRequest);
    console.log('Source: %j', source);
  }

  getSource();
  // [END securitycenter_get_source_v2]
}

main(...process.argv.slice(2));
