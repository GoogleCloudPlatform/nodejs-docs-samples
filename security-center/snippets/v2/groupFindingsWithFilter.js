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

// Group filtered findings under a parent type across all sources by their specified properties
// (e.g. category, state).
async function main() {
  // [START securitycenter_group_filtered_findings_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();

  // TODO(developer): Update the following for your own environment.
  const organizationId = '1081635000895';
  const location = 'global';

  async function createSampleFinding() {
    const uuid = require('uuid');

    const [source] = await client.createSource({
      source: {
        displayName: 'Customized Display Name V2',
        description: 'A new custom source that does X',
      },
      parent: client.organizationPath(organizationId),
    });

    const sourceId = source.name.split('/')[3];

    // Resource name of the new finding's parent. Examples:
    //  - `organizations/[organization_id]/sources/[source_id]`
    //  - `organizations/[organization_id]/sources/[source_id]/locations/[location_id]`
    const parent = `organizations/${organizationId}/sources/${sourceId}/locations/${location}`;

    // The resource this finding applies to. The Cloud Security Command Center UI can link the
    // findings for a resource to the corresponding asset of a resource if there are matches.
    const resourceName = `//cloudresourcemanager.googleapis.com/organizations/${organizationId}`;

    // Unique identifier provided by the client within the parent scope.
    // It must be alphanumeric and less than or equal to 32 characters and
    // greater than 0 characters in length.
    const findingId = uuid.v4().replace(/-/g, '');

    // Get the current timestamp.
    const eventDate = new Date();

    // Finding category.
    const category = 'MEDIUM_RISK_ONE';

    // Build the finding request object.
    const createFindingRequest = {
      parent: parent,
      findingId: findingId,
      finding: {
        resourceName,
        category,
        state: 'ACTIVE',
        // The time associated with discovering the issue.
        eventTime: {
          seconds: Math.floor(eventDate.getTime() / 1000),
          nanos: (eventDate.getTime() % 1000) * 1e6,
        },
      },
    };

    await client.createFinding(createFindingRequest);

    const name = `organizations/${organizationId}/sources/${sourceId}/locations/${location}/findings/${findingId}`;

    // Build the request.
    const setMuteRequest = {
      name,
      mute: 'UNMUTED',
    };

    const [finding] = await client.setMute(setMuteRequest);
    console.log('Unmute finding: %j', finding.mute);

    return sourceId;
  }

  const sourceId = await createSampleFinding();

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
  const parent = `organizations/${organizationId}/sources/${sourceId}/locations/${location}`;

  // Supported grouping properties: resource_name/ category/ state/ parent/ severity.
  // Multiple properties should be separated by comma.
  const groupBy = 'category,state';

  // Group all findings of category "MEDIUM_RISK_ONE".
  const filter = 'category="MEDIUM_RISK_ONE"';

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

  await groupFilteredFindings();
  // [END securitycenter_group_filtered_findings_v2]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
