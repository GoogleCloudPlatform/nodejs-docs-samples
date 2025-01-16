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
 *  Update an existing security health analytics custom module
 */
function main(organizationId, customModuleId, locationId = 'global') {
  // [START securitycenter_update_security_health_analytics_custom_module]
  // npm install '@google-cloud/securitycentermanagement'
  const {
    SecurityCenterManagementClient,
    protos,
  } = require('@google-cloud/securitycentermanagement');

  const client = new SecurityCenterManagementClient();

  const EnablementState =
    protos.google.cloud.securitycentermanagement.v1
      .SecurityHealthAnalyticsCustomModule.EnablementState;

  /*
   * Required. Resource name of security health analytics module.
   *     Its format is
   *    `organizations/[organization_id]/locations/[location_id]/securityHealthAnalyticsCustomModules/[custom_module]`
   *    `folders/[folder_id]/locations/[location_id]/securityHealthAnalyticsCustomModules/[custom_module]`
   *    `projects/[project_id]/locations/[location_id]/securityHealthAnalyticsCustomModules/[custom_module]`
   */
  const name = `organizations/${organizationId}/locations/${locationId}/securityHealthAnalyticsCustomModules/${customModuleId}`;

  // define the security health analytics custom module configuration, update the
  // EnablementState below
  const securityHealthAnalyticsCustomModule = {
    name: name,
    enablementState: EnablementState.DISABLED,
  };

  // Set the field mask to specify which properties should be updated.
  const fieldMask = {
    paths: ['enablement_state'],
  };

  async function updateSecurityHealthAnalyticsCustomModule() {
    const [response] = await client.updateSecurityHealthAnalyticsCustomModule({
      updateMask: fieldMask,
      securityHealthAnalyticsCustomModule: securityHealthAnalyticsCustomModule,
    });
    console.log(
      'Security Health Analytics Custom Module update succeeded: ',
      response
    );
  }

  updateSecurityHealthAnalyticsCustomModule();
  // [END securitycenter_update_security_health_analytics_custom_module]
}

main(...process.argv.slice(2));
