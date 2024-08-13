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

async function main(projectId, location = 'global') {
  // [START securitycenter_list_notification_configs_v2]
  // npm install @google-cloud/security-center/
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();

  /**
   *  Required. The name of the parent in which to list the notification
   *  configurations. Its format is
   *  "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */
  const parent = `projects/${projectId}/locations/${location}`;

  async function listNotificationConfigs() {
    const iterable = client.listNotificationConfigsAsync({parent: parent});
    console.log('Received Notification configs: %j');
    for await (const response of iterable) {
      console.log(response);
    }
  }

  await listNotificationConfigs();
  // [END securitycenter_list_notification_configs_v2]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
