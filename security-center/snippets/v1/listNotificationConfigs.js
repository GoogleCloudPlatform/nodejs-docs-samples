// Copyright 2020 Google LLC
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

function main(organizationId = 'your-org-id') {
  // [START securitycenter_list_notification_configs]
  // npm install @google-cloud/security-center/
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  const client = new SecurityCenterClient();

  // parent: must be in one of the following formats:
  //    `organizations/${organization_id}`
  //    `projects/${project_id}`
  //    `folders/${folder_id}`
  const parent = `organizations/${organizationId}`;

  async function listNotificationConfigs() {
    const [resources] = await client.listNotificationConfigs({parent: parent});
    console.log('Received Notification configs: ');
    for (const resource of resources) {
      console.log(resource);
    }
  }

  listNotificationConfigs();
  // [END securitycenter_list_notification_configs]
}

main(...process.argv.slice(2));
