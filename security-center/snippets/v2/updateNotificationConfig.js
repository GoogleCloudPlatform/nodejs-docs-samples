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

/**
 * Update an existing notification config.
 * If updating a Pubsub Topic, ensure the ServiceAccount has the
 * "pubsub.topics.setIamPolicy" permission on the new topic.
 */
async function main(projectId, notificationId, topicName, location = 'global') {
  // [START securitycenter_update_notification_config_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
  // Instantiates a client
  const client = new SecurityCenterClient();

  /**
   *  Required. Name of the notification config to update. The following list shows
   *  some examples of the format:
   *  `organizations/[organization_id]/locations/[location_id]/notificationConfigs/[config_id]`
   *  `folders/[folder_id]/locations/[location_id]/notificationConfigs/[config_id]`
   *  `projects/[project_id]/locations/[location_id]/notificationConfigs/[config_id]`
   */
  const name = `projects/${projectId}/locations/${location}/notificationConfigs/${notificationId}`;

  // pubsubTopic = "projects/{your-project}/topics/{your-topic}";
  const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

  /**
   *  Required. The notification config to update.
   */
  const notificationConfig = {
    name: name,
    description: 'updated description',
    pubsubTopic: pubsubTopic,
    streamingConfig: {filter: 'state = "ACTIVE"'},
  };

  /**
   *  The FieldMask to use when updating the notification config.
   *  If empty all mutable fields will be updated.
   */
  const fieldMask = {
    paths: ['description', 'pubsub_topic', 'streaming_config.filter'],
  };

  // Build the request.
  const updateNotificationConfigRequest = {
    notificationConfig: notificationConfig,
  };

  async function updateNotificationConfig() {
    const [response] = await client.updateNotificationConfig(
      updateNotificationConfigRequest,
      fieldMask
    );
    console.log('Notification configuration update successful: %j', response);
  }

  await updateNotificationConfig();
  // [END securitycenter_update_notification_config_v2]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
