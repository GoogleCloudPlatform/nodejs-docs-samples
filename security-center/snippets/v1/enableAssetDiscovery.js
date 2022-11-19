// Copyright 2019 Google LLC
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
 * Demostrates enabling asset discovery for an organization.
 */
function main(organizationId = 'YOUR_NUMERIC_ORG_ID') {
  // [START securitycenter_enable_asset_discovery]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();

  async function updateOrgSettings() {
    //  organizationId is the numeric ID of the organization.
    /*
     * TODO(developer): Uncomment the following lines
     */
    // const organizationId = "111122222444";
    const orgName = client.organizationPath(organizationId);
    const [newSettings] = await client.updateOrganizationSettings({
      organizationSettings: {
        name: `${orgName}/organizationSettings`,
        enableAssetDiscovery: true,
      },
      // Only update the enableAssetDiscovery field.
      updateMask: {paths: ['enable_asset_discovery']},
    });

    console.log('New settings: %j', newSettings);
  }
  updateOrgSettings();
  // [END securitycenter_enable_asset_discovery]
}

main(...process.argv.slice(2));
