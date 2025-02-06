/*
 * Copyright 2025 Google LLC
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

// List all effective event threat detection custom module under a given parent resource.
function main(organizationId, location = 'global') {
  // [START securitycenter_list_effective_event_threat_detection_custom_module]
  // Imports the Google Cloud client library.
  const {SecurityCenterManagementClient} =
    require('@google-cloud/securitycentermanagement').v1;

  // Create a Security Center Management client
  const client = new SecurityCenterManagementClient();

  /**
   *  Required. The name of the parent resource. Its
   *  format is "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */
  //TODO(developer): Update the following references for your own environment before running the sample.
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  const parent = `organizations/${organizationId}/locations/${location}`;

  // Build the request.
  const listEffectiveEventThreatDetectionCustomModulesRequest = {
    parent: parent,
  };

  async function listEffectiveEventThreatDetectionCustomModules() {
    // Call the API.
    const [modules] =
      await client.listEffectiveEventThreatDetectionCustomModules(
        listEffectiveEventThreatDetectionCustomModulesRequest
      );
    for (const module of modules) {
      console.log('Custom Module name:', module.name);
    }
  }

  listEffectiveEventThreatDetectionCustomModules();
  // [END securitycenter_list_effective_event_threat_detection_custom_module]
}

main(...process.argv.slice(2));
