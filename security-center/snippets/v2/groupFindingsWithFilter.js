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
 * Group filtered findings under a parent type across all sources by their specified properties
 * (e.g. category, state).
 */
function main(organizationId, sourceId, location = 'global') {
  // [START securitycenter_group_filtered_findings_v2]
  // Imports the Google Cloud client library.
  const { SecurityCenterClient } = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();
     /**
   *  Required. Name of the source to groupBy. If no location is specified,
   *  finding is assumed to be in global.
   *   The following list shows some examples:
   *  `organizations/[organization_id]/sources/[source_id]`
   *  `organizations/[organization_id]/sources/[source_id]/locations/[location_id]`
   *  `folders/[folder_id]/sources/[source_id]`
   *  `folders/[folder_id]/sources/[source_id]/locations/[location_id]`
   *  `projects/[project_id]/sources/[source_id]`
   *  `projects/[project_id]/sources/[source_id]/locations/[location_id]`
   *  To groupBy across all sources provide a source_id of `-`. The following
   *  list shows some examples:
   *  `organizations/{organization_id}/sources/-`
   *  `organizations/{organization_id}/sources/-/locations/[location_id]`
   *  `folders/{folder_id}/sources/-`
   *  `folders/{folder_id}/sources/-/locations/[location_id]`
   *  `projects/{project_id}/sources/-`
   *  `projects/{project_id}/sources/-/locations/[location_id]`
   */
  const parent =  `organizations/${organizationId}/sources/${sourceId}/locations/${location}`;

   // Supported grouping properties: resource_name/ category/ state/ parent/ severity.
   // Multiple properties should be separated by comma.
   const groupBy = 'category,state';

   // Group all findings of category "MEDIUM_RISK_ONE".
   const filter = "category=\"MEDIUM_RISK_ONE\"";

  // Build the group findings request.
  const groupFilteredFindingsRequest = {
    parent,
    groupBy,
    filter,
  };

  async function groupFilteredFindings() {

    // Call the API.
    const iterable = client.groupFindingsAsync(groupFilteredFindingsRequest);
    let count = 0;
    
    for await (const response of iterable) {
        console.log(
            `${++count} ${response.properties.category} ${response.properties.state}`
        );
    }
  }

  groupFilteredFindings();
  // [END securitycenter_group_filtered_findings_v2]
}

main(...process.argv.slice(2));