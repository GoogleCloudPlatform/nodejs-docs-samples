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
 * Retrieves a mute configuration given its resource name.
 */
function main(organizationId, muteConfigId) {
  // [START securitycenter_create_mute_config_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

  /**
   *  Required. Name of the mute config to retrieve. The following list shows
   *  some examples of the format:
   *  `organizations/{organization}/muteConfigs/{config_id}`
   *  `organizations/{organization}/locations/{location}/muteConfigs/{config_id}`
   *  `folders/{folder}/muteConfigs/{config_id}`
   *  `folders/{folder}/locations/{location}/muteConfigs/{config_id}`
   *  `projects/{project}/muteConfigs/{config_id}`
   *  `projects/{project}/locations/{location}/muteConfigs/{config_id}`
   */

  /**
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const muteConfigId = 'MUTE_CONFIG_ID';

  const name = `organizations/${organizationId}/muteConfigs/${muteConfigId}`;

  // Build the request.
  const getMuteRuleRequest = {
    name,
  };

  async function createMuteRuleConfig() {
    // Call the API.
    const [muteConfig] = await client.getMuteConfig(getMuteRuleRequest);
    console.log('Get mute rule config: %j', muteConfig);
  }

  createMuteRuleConfig();
  // [END securitycenter_create_mute_config_v2]
}

main(...process.argv.slice(2));
