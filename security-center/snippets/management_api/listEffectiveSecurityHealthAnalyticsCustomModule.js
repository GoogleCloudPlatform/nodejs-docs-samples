// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

/**
 *  List all effective security health analytics custom module under a given parent resource
 */
function main(organizationId, locationId = 'global') {
  // [START securitycenter_list_effective_security_health_analytics_custom_module]
  // npm install '@google-cloud/securitycentermanagement'
  const {
    SecurityCenterManagementClient,
  } = require('@google-cloud/securitycentermanagement');

  const client = new SecurityCenterManagementClient();

  /*
   * Required. The name of the parent resource of security health analytics module
   *     Its format is
   *    `organizations/[organization_id]/locations/[location_id]`
   *    `folders/[folder_id]/locations/[location_id]`
   *    `projects/[project_id]/locations/[location_id]`
   */
  const parent = `organizations/${organizationId}/locations/${locationId}`;

  async function listEffectiveSecurityHealthAnalyticsCustomModule() {
    const [response] =
      await client.listEffectiveSecurityHealthAnalyticsCustomModules({
        parent: parent,
      });
    console.log(
      'Security Health Analytics Custom Module list effective succeeded: ',
      response
    );
  }

  listEffectiveSecurityHealthAnalyticsCustomModule();
  // [END securitycenter_list_effective_security_health_analytics_custom_module]
}

main(...process.argv.slice(2));
