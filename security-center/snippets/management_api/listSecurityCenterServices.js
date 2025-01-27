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

// List all security center services for the given parent.
function main(organizationId, location = 'global') {
  // [START securitycenter_list_security_center_service]
  // Imports the Google Cloud client library.
  const {SecurityCenterManagementClient} =
    require('@google-cloud/securitycentermanagement').v1;

  // Create a Security Center Management client
  const client = new SecurityCenterManagementClient();

  /**
   *  Required. The name of the parent resource. Its
   *  format is "organizations/[organizationId]/locations/[location]",
   *  "folders/[folderId]/locations/[location]", or
   *  "projects/[projectId]/locations/[location]".
   */
  //TODO(developer): Update the organization ID and location to match your environment.
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  const parent = `organizations/${organizationId}/locations/${location}`;

  // Build the request.
  const listSecurityCenterServicesRequest = {
    parent: parent,
  };

  async function listSecurityCenterServices() {
    // Call the API.
    const [services] = await client.listSecurityCenterServices(
      listSecurityCenterServicesRequest
    );
    for (const service of services) {
      console.log('Security Center Service Name:', service.name);
    }
  }

  listSecurityCenterServices();
  // [END securitycenter_list_security_center_service]
}

main(...process.argv.slice(2));
