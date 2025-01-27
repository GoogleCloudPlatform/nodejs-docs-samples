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

// Updates a security center service configuration.
function main(organizationId, service, location = 'global') {
  // [START securitycenter_update_security_center_service]
  // Imports the Google Cloud client library.
  const {SecurityCenterManagementClient} =
    require('@google-cloud/securitycentermanagement').v1;

  // Create a Security Center Management client
  const client = new SecurityCenterManagementClient();

  /*
   * Required. Resource name of security center service
   *     Its format is
   *    `organizations/[organizationId]/locations/[location]/securityCenterServices/[service]`
   *    `folders/[folderId]/locations/[location]/securityCenterServices/[service]`
   *    `projects/[projectId]/locations/[location]/securityCenterServices/[service]`
   */
  // TODO(developer): Update the following references for your own environment before running the sample.
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  // const service = 'SERVICE';
  // Replace SERVICE with one of the valid values:
  // container-threat-detection, event-threat-detection, security-health-analytics,
  // vm-threat-detection, web-security-scanner
  const name = `organizations/${organizationId}/locations/${location}/securityCenterServices/${service}`;

  // Define the security center service configuration, update the
  // IntendedEnablementState accordingly.
  const securityCenterService = {
    name: name,
    intendedEnablementState: 'ENABLED',
  };

  // Set the field mask to specify which properties should be updated.
  const fieldMask = {
    paths: ['intended_enablement_state'],
  };

  // Build the request.
  const updateSecurityCenterServiceRequest = {
    securityCenterService: securityCenterService,
    updateMask: fieldMask,
  };

  async function updateSecurityCenterService() {
    // Call the API.
    const [response] = await client.updateSecurityCenterService(
      updateSecurityCenterServiceRequest
    );
    console.log(
      `Updated SecurityCenterService: ${response.name} with new enablement state: ${response.intendedEnablementState}`
    );
  }

  updateSecurityCenterService();
  // [END securitycenter_update_security_center_service]
}

main(...process.argv.slice(2));
