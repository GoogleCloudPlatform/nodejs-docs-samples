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
 * Updates a notification channel in Cloud Monitoring.
 *
 * @param {string} projectId The project ID containing the notification channel.
 * @param {string} channelId The ID of the notification channel to update.
 * @param {boolean} enabled Whether the channel should be enabled.
 */
async function main(projectId, channelId, enabled = 'true') {
  // [START monitoring_alert_update_channel]
  // [START monitoring_alert_enable_channel]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.NotificationChannelServiceClient();

  async function updateNotificationChannel() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const channelId = '1234567890';
    // const enabled = true;

    if (!projectId || !channelId) {
      throw new Error('Both projectId and channelId are required.');
    }

    const channelName = client.projectNotificationChannelPath(
      projectId,
      channelId
    );
    const isEnabled = enabled === true || enabled === 'true';

    const updateChannelRequest = {
      updateMask: {
        paths: ['enabled'],
      },
      notificationChannel: {
        name: channelName,
        enabled: {
          value: isEnabled,
        },
      },
    };

    try {
      const [response] = await client.updateNotificationChannel(
        updateChannelRequest
      );
      console.log(`Updated channel ${response.name} (enabled: ${isEnabled}).`);
      return response;
    } catch (err) {
      console.error(`Failed to update notification channel: ${err.message}`);
      throw err;
    }
  }

  return await updateNotificationChannel();
  // [END monitoring_alert_enable_channel]
  // [END monitoring_alert_update_channel]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (require.main === module) {
  main(...process.argv.slice(2));
}

module.exports = main;
