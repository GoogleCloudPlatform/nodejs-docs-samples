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
 * Creates a notification config in a project under a given location.
 * Ensure the ServiceAccount has the "pubsub.topics.setIamPolicy" permission on the new topic.
 */
async function main(projectId, topicName, location = 'global') {
  // [START securitycenter_create_notification_config_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
  const uuidv1 = require('uuid').v1;

  const client = new SecurityCenterClient();
  /*
   *  Required. Resource name of the new notification config's parent. Its format
   *  is "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */
  const parent = `projects/${projectId}/locations/${location}`;

  /**
   *  Required.
   *  Unique identifier provided by the client within the parent scope.
   *  It must be between 1 and 128 characters and contain alphanumeric
   *  characters, underscores, or hyphens only.
   */
  const configId = 'notif-config-test-node-create-' + uuidv1();

  // pubsubTopic = "projects/{your-project}/topics/{your-topic}";
  const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

  /**
   *  Required. The notification config being created. The name and the service
   *  account will be ignored as they are both output only fields on this
   *  resource.
   */
  const notificationConfig = {
    description: 'Sample config for node v2',
    pubsubTopic: pubsubTopic,
    streamingConfig: {filter: 'state = "ACTIVE"'},
  };

  // Build the request.
  const createNotificationRequest = {
    parent: parent,
    configId: configId,
    notificationConfig: notificationConfig,
  };

  async function createNotificationConfig() {
    const [response] = await client.createNotificationConfig(
      createNotificationRequest
    );
    console.log('Notification configuration creation successful: %j', response);
  }

  await createNotificationConfig();
  // [END securitycenter_create_notification_config_v2]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
