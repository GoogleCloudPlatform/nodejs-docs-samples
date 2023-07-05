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
  // [START securitycenter_update_notification_config]
  // npm install @google-cloud/security-center/
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  const client = new SecurityCenterClient();

  // formattedConfigName: You can also use
  //    `client.projectNotificationConfigPath(projectId, configId)` or
  //    `client.folderNotificationConfigPath(folderId, configId)`.
  // configId = "your-config-id";
  const formattedConfigName = client.organizationNotificationConfigPath(
    organizationId,
    configId
  );

  // pubsubTopic = "projects/{your-project}/topics/{your-topic}";
  // Ensure this Service Account has the "pubsub.topics.setIamPolicy" permission on this topic.

  async function updateNotificationConfig() {
    const [response] = await client.updateNotificationConfig({
      updateMask: {
        paths: ['description', 'pubsub_topic', 'streaming_config.filter'],
      },
      notificationConfig: {
        name: formattedConfigName,
        description: 'Updated config description',
        pubsubTopic: pubsubTopic,
        streamingConfig: {filter: 'state = "INACTIVE"'},
      },
    });
    console.log('notification config update succeeded: ', response);
  }

  updateNotificationConfig();
  // [END securitycenter_update_notification_config]
}

main(...process.argv.slice(2));
