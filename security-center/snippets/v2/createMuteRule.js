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
 * Creates a mute configuration in a project under a given location.
 */
function main(organizationId, location = 'global') {
  // [START securitycenter_create_mute_config_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

  /**
   *  Required. Resource name of the new mute configs's parent. Its format is
   *  "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */

  /**
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  const parent = `organizations/${organizationId}/locations/${location}`;

  /**
   *  Required. Unique identifier provided by the client within the parent scope.
   *  It must consist of only lowercase letters, numbers, and hyphens, must start
   *  with a letter, must end with either a letter or a number, and must be 63
   *  characters or less.
   */
  const muteConfigId = 'muteid-' + Math.floor(Math.random() * 10000);

  const name = `${parent}/muteConfigs/${muteConfigId}`;

  // Build the muteRuleConfig object.
  const muteConfig = {
    name: name,
    description: "Mute low-medium IAM grants excluding 'compute' resources",
    filter:
      'severity="LOW" OR severity="MEDIUM" AND ' +
      'category="Persistence: IAM Anomalous Grant" AND ' +
      '-resource.type:"compute"',
    type: 'STATIC',
  };

  // Build the create mute rule request.
  const createMuteRuleRequest = {
    parent,
    muteConfig,
    muteConfigId,
  };

  async function createMuteRuleConfig() {
    // Call the API.
    const [muteConfig] = await client.createMuteConfig(createMuteRuleRequest);
    console.log('New mute rule config created: %j', muteConfig);
  }

  createMuteRuleConfig();
  // [END securitycenter_create_mute_config_v2]
}

main(...process.argv.slice(2));
