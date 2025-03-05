/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 *  Retrieve an existing effective event threat detection custom module.
 */
function main(organizationId, customModuleId, location = 'global') {
  // [START securitycenter_get_effective_event_threat_detection_custom_module]
  // Imports the Google Cloud client library.
  const {SecurityCenterManagementClient} =
    require('@google-cloud/securitycentermanagement').v1;

  // Create a Security Center Management client
  const client = new SecurityCenterManagementClient();

  /*
   * Required. Resource name of effective event threat detection module.
   *     Its format is
   *    `organizations/[organization_id]/locations/[location_id]/effectiveEventThreatDetectionCustomModules/[custom_module]`
   *    `folders/[folder_id]/locations/[location_id]/effectiveEventThreatDetectionCustomModules/[custom_module]`
   *    `projects/[project_id]/locations/[location_id]/effectiveEventThreatDetectionCustomModules/[custom_module]`
   */
  // TODO(developer): Update the following references for your own environment before running the sample.
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  // const customModuleId = 'CUSTOM_MODULE_ID';
  const name = `organizations/${organizationId}/locations/${location}/effectiveEventThreatDetectionCustomModules/${customModuleId}`;

  // Build the request.
  const getEffectiveEventThreatDetectionCustomModuleRequest = {
    name: name,
  };

  async function getEffectiveEventThreatDetectionCustomModule() {
    // Call the API.
    const [response] =
      await client.getEffectiveEventThreatDetectionCustomModule(
        getEffectiveEventThreatDetectionCustomModuleRequest
      );
    console.log(
      'Retrieved EffectiveEventThreatDetectionCustomModule: %j',
      response
    );
  }

  getEffectiveEventThreatDetectionCustomModule();
  // [END securitycenter_get_effective_event_threat_detection_custom_module]
}

main(...process.argv.slice(2));
