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
 *   Kicks off a long-running operation (LRO) to bulk mute findings for a parent based on a filter.
 *   The parent can be either an organization, folder, or project. The findings
 *   matched by the filter will be muted after the LRO is done.
 */
function main(organizationId, projectId, location = 'global') {
  // [START securitycenter_bulk_mute_v2]
  // Imports the Google Cloud client library.
  const { SecurityCenterClient } = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

   /**
   *  Required. The parent, at which bulk action needs to be applied. If no
   *  location is specified, findings are updated in global. The following list
   *  shows some examples:
   *  `organizations/[organization_id]`
   *  `organizations/[organization_id]/locations/[location_id]`
   *  `folders/[folder_id]`
   *  `folders/[folder_id]/locations/[location_id]`
   *  `projects/[project_id]`
   *  `projects/[project_id]/locations/[location_id]`
   */
  const parent = `organizations/${organizationId}/locations/${location}`;

  // muteRule: Expression that identifies findings that should be muted.
  // Can also refer to an organization/ folder.
  // eg: "resource.project_display_name=\"PROJECT_ID\""
  const filter = `resource.project_display_name="${projectId}"`;

  // Build the request.
  const bulkMuteFindingRequest = {
    parent,
    filter
  };

  async function callBulkMuteFindings() {

    // Call the API.
    const [operation] = await client.bulkMuteFindings(bulkMuteFindingRequest);
    const [response] = await operation.promise();
    console.log('Bulk mute findings completed successfully: %j', response);
  }
  
  callBulkMuteFindings();
  // [END securitycenter_bulk_mute_v2]
}

main(...process.argv.slice(2));