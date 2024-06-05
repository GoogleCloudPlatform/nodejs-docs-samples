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
 * Updates an existing mute configuration.
 */
function main(organizationId, muteConfigId ,location = 'global',) {
  // [START securitycenter_update_mute_config_v2]
  // Imports the Google Cloud client library.
  const { SecurityCenterClient } = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

  const name = `organizations/${organizationId}/locations/${location}/muteConfigs/${muteConfigId}`;
  /**
   *  The list of fields to be updated.
   *  If empty all mutable fields will be updated.
  */
  const updateMask = {
    paths: ['description'],
  };

  // Build the mute rule object.
  const muteConfig = {
    name,
    description: "Updated mute config description",
    updateMask,
    filter:
    "severity=\"LOW\" OR severity=\"MEDIUM\" AND " +
    "category=\"Persistence: IAM Anomalous Grant\" AND " +
    "-resource.type:\"compute\"",
    type: "STATIC",
  };

  // Build the update mute rule request.
  const updateMuteConfigRequest = {
    muteConfig
  };

  async function updateMuteConfig() {

    // Call the API.
    const [muteConfig] = await client.updateMuteConfig(updateMuteConfigRequest);
    console.log('Update mute rule config: %j', muteConfig);
  }
  
  updateMuteConfig();
  // [END securitycenter_update_mute_config_v2]
}

main(...process.argv.slice(2));