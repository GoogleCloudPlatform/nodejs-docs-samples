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
 *   Mute an individual finding.
 *   If a finding is already muted, muting it again has no effect.
 *   Various mute states are: MUTE_UNSPECIFIED/MUTE/UNMUTE.
 */
function main(organizationId, sourceId, findingId, location = 'global') {
  // [START securitycenter_set_mute_v2]
  // Imports the Google Cloud client library.
  const { SecurityCenterClient } = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

  /**
   *  Required. The relative resource
   *  name (https://cloud.google.com/apis/design/resource_names#relative_resource_name)
   *  of the finding. If no location is specified, finding is assumed to be in
   *  global. The following list shows some examples:
   *  `organizations/{organization_id}/sources/{source_id}/findings/{finding_id}`
   *  `organizations/{organization_id}/sources/{source_id}/locations/{location_id}/findings/{finding_id}`
   *  `folders/{folder_id}/sources/{source_id}/findings/{finding_id}`
   *  `folders/{folder_id}/sources/{source_id}/locations/{location_id}/findings/{finding_id}`
   *  `projects/{project_id}/sources/{source_id}/findings/{finding_id}`
   *  `projects/{project_id}/sources/{source_id}/locations/{location_id}/findings/{finding_id}`
   */
  const name = `organizations/${organizationId}/sources/${sourceId}/locations/${location}/findings/${findingId}`;

  // Build the request.
  const setMuteRequest = {
    name,
    mute: 'MUTED' 
  };

  async function setMute() {

    // Call the API.
    const [finding] = await client.setMute(setMuteRequest);
    console.log('Mute value for the finding: %j', finding.mute);
  }
  
  setMute();
  // [END securitycenter_set_mute_v2]
}

main(...process.argv.slice(2));