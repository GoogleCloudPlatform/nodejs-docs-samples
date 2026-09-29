// Copyright 2018 Google LLC
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
 * Replaces the notification channels of an alert policy.
 *
 * @param {string} projectId The project ID containing the alert policy and channels.
 * @param {string} alertPolicyId The ID of the alert policy to update.
 * @param {...string} channelIds The list of notification channel IDs to attach to the policy.
 */
async function main(projectId, alertPolicyId, ...channelIds) {
  // [START monitoring_alert_replace_channels]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates clients
  const alertClient = new monitoring.AlertPolicyServiceClient();
  const notificationClient = new monitoring.NotificationChannelServiceClient();

  async function replaceChannels() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const alertPolicyId = '123456789012314';
    // const channelIds = [
    //   'channel-1',
    //   'channel-2',
    //   'channel-3',
    // ];

    if (!projectId || !alertPolicyId) {
      throw new Error('Both projectId and alertPolicyId are required.');
    }

    const notificationChannels = channelIds.map(id =>
      notificationClient.projectNotificationChannelPath(projectId, id)
    );

    const updateAlertPolicyRequest = {
      updateMask: {
        paths: ['notification_channels'],
      },
      alertPolicy: {
        name: alertClient.projectAlertPolicyPath(projectId, alertPolicyId),
        notificationChannels: notificationChannels,
      },
    };

    try {
      const [alertPolicy] = await alertClient.updateAlertPolicy(
        updateAlertPolicyRequest
      );
      console.log(`Updated ${alertPolicy.name}.`);
      return alertPolicy;
    } catch (err) {
      console.error(`Failed to update alert policy: ${err.message}`);
      throw err;
    }
  }

  return await replaceChannels();
  // [END monitoring_alert_replace_channels]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (require.main === module) {
  main(...process.argv.slice(2));
}

module.exports = main;
