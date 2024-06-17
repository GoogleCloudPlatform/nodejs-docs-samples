/*
 * Copyright 2024 Google LLC
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

//Retrieve an existing notification config.
function main(projectId, notificationId, location = 'global') {
  // [START securitycenter_get_notification_config_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();
  /**
   *  Required. Name of the notification config to get. The following list shows
   *  some examples of the format:
   *  `organizations/[organization_id]/locations/[location_id]/notificationConfigs/[config_id]`
   *  `folders/[folder_id]/locations/[location_id]/notificationConfigs/[config_id]`
   *  `projects/[project_id]/locations/[location_id]/notificationConfigs/[config_id]`
   */
  const name = `projects/${projectId}/locations/${location}/notificationConfigs/${notificationId}`;

  // Build the request.
  const getNotificationConfigRequest = {
    name: name,
  };

  async function getNotificationConfig() {
    const [response] = await client.getNotificationConfig(
      getNotificationConfigRequest
    );
    console.log('Notification config: %j', response);
  }

  getNotificationConfig();
  // [END securitycenter_get_notification_config_v2]
}

main(...process.argv.slice(2));
