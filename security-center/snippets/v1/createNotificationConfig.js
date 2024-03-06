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

function main(
  organizationId = 'your-org-id',
  configId = 'your-config-name',
  pubsubTopic = 'projects/{your-project}/topics/{your-topic}'
) {
  // [START securitycenter_create_notification_config]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  const client = new SecurityCenterClient();

  // parent: must be in one of the following formats:
  //    `organizations/${organization_id}`
  //    `projects/${project_id}`
  //    `folders/${folder_id}`
  // configId = "your-config-name";
  // pubsubTopic = "projects/{your-project}/topics/{your-topic}";
  // Ensure this Service Account has the "pubsub.topics.setIamPolicy" permission on this topic.
  const parent = `organizations/${organizationId}`;

  async function createNotificationConfig() {
    const [response] = await client.createNotificationConfig({
      parent: parent,
      configId: configId,
      notificationConfig: {
        description: 'Sample config for node.js',
        pubsubTopic: pubsubTopic,
        streamingConfig: {filter: 'state = "ACTIVE"'},
      },
    });
    console.log('Notification config creation succeeded: ', response);
  }

  createNotificationConfig();
  // [END securitycenter_create_notification_config]
}

main(...process.argv.slice(2));
