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

// Retrieve a specific security center service by its name.
function main(organizationId, service, location = 'global') {
  // [START securitycenter_get_security_center_service]
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
  // TODO(developer): Update the organization ID, location, and service name to match your environment.
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  // const service = 'SERVICE';
  // Replace SERVICE with one of the valid values:
  // container-threat-detection, event-threat-detection, security-health-analytics,
  // vm-threat-detection, web-security-scanner
  const name = `organizations/${organizationId}/locations/${location}/securityCenterServices/${service}`;

  // Build the request.
  const getSecurityCenterServiceRequest = {
    name: name,
  };

  async function getSecurityCenterService() {
    // Call the API.
    const [response] = await client.getSecurityCenterService(
      getSecurityCenterServiceRequest
    );
    console.log('Retrieved SecurityCenterService:', response.name);
  }

  getSecurityCenterService();
  // [END securitycenter_get_security_center_service]
}

main(...process.argv.slice(2));
