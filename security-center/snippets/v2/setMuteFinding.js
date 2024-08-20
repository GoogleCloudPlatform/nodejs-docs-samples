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

// Mute an individual finding.
// If a finding is already muted, muting it again has no effect.
// Various mute states are: MUTE_UNSPECIFIED/MUTE/UNMUTE.
async function main() {
  // [START securitycenter_set_mute_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Create a Security Center client
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
    return {sourceId, findingId};
  }

  const {sourceId, findingId} = await createSampleFinding();

  // The relative resource name (https://cloud.google.com/apis/design/resource_names#relative_resource_name)
  // of the finding. If no location is specified, finding is assumed to be in
  // global. The following list shows some examples:
  // - `organizations/{organization_id}/sources/{source_id}/findings/{finding_id}`
  // - `organizations/{organization_id}/sources/{source_id}/locations/{location_id}/findings/{finding_id}`
  // - `folders/{folder_id}/sources/{source_id}/findings/{finding_id}`
  // - `folders/{folder_id}/sources/{source_id}/locations/{location_id}/findings/{finding_id}`
  // - `projects/{project_id}/sources/{source_id}/findings/{finding_id}`
  // - `projects/{project_id}/sources/{source_id}/locations/{location_id}/findings/{finding_id}`
  const name = `organizations/${organizationId}/sources/${sourceId}/locations/${location}/findings/${findingId}`;

  // Build the request.
  const setMuteRequest = {
    name,
    mute: 'MUTED',
  };

  async function setMute() {
    // Call the API.
    const [finding] = await client.setMute(setMuteRequest);
    console.log('Mute value for the finding: %j', finding.mute);
  }

  await setMute();
  // [END securitycenter_set_mute_v2]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
