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
 * List all findings under a given parent resource.
 */
function main(organizationId, location = 'global') {
  // [START securitycenter_list_findings_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();
  /**
   *  Required. Name of the source the findings belong to. If no location is
   *  specified, the default is global. The following list shows some examples:
   *  `organizations/[organization_id]/sources/[source_id]/locations/[location_id]`
   *  `folders/[folder_id]/sources/[source_id]`
   *  `folders/[folder_id]/sources/[source_id]/locations/[location_id]`
   *  `projects/[project_id]/sources/[source_id]`
   *  `projects/[project_id]/sources/[source_id]/locations/[location_id]`
   */
  const parent = `organizations/${organizationId}/sources/-/locations/${location}`;

  // Build the list findings request.
  const listFindingsRequest = {
    parent,
  };

  async function listAllFindings() {
    // Call the API.
    const iterable = client.listFindingsAsync(listFindingsRequest);
    let count = 0;

    for await (const response of iterable) {
      console.log(
        `${++count} ${response.finding.name} ${response.finding.resourceName}`
      );
    }
  }

  listAllFindings();
  // [END securitycenter_list_findings_v2]
}

main(...process.argv.slice(2));
