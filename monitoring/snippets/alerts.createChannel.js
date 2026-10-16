// Copyright 2026 Google LLC
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

/**
 * Creates a notification channel in Cloud Monitoring.
 *
 * @param {string} projectId The project ID to create the notification channel for.
 * @param {string} emailAddress The email address to receive notifications.
 * @param {string} displayName The display name of the channel.
 */
async function main(
  projectId,
  emailAddress = 'alerts@example.com',
  displayName = 'Email Notification Channel'
) {
  // [START monitoring_alert_create_channel]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.NotificationChannelServiceClient();

  async function createNotificationChannel() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const emailAddress = 'alerts@example.com';
    // const displayName = 'Email Notification Channel';

    if (!projectId) {
      throw new Error('Project ID is required.');
    }

    const request = {
      name: client.projectPath(projectId),
      notificationChannel: {
        type: 'email',
        displayName: displayName,
        description: 'Channel for alert notifications',
        labels: {
          email_address: emailAddress,
        },
      },
    };

    try {
      const [channel] = await client.createNotificationChannel(request);
      console.log(`Created notification channel ${channel.name} (${channel.displayName}).`);
      return channel;
    } catch (err) {
      console.error(`Failed to create notification channel: ${err.message}`);
      throw err;
    }
  }

  return await createNotificationChannel();
  // [END monitoring_alert_create_channel]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (require.main === module) {
  main(...process.argv.slice(2));
}

module.exports = main;
