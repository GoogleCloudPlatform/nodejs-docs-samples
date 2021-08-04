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

function main(projectId, alertPolicyId, ...channelIds) {
  // [START monitoring_alert_replace_channels]
  // [START monitoring_alert_enable_channel]
  // [START monitoring_alert_update_channel]
  // [START monitoring_alert_create_channel]

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

    const notificationChannels = channelIds.map(id =>
      notificationClient.projectNotificationChannelPath(projectId, id)
    );

    for (const channel of notificationChannels) {
      const updateChannelRequest = {
        updateMask: {
          paths: ['enabled'],
        },
        notificationChannel: {
          name: channel,
          enabled: {
            value: true,
          },
        },
      };
      try {
        await notificationClient.updateNotificationChannel(
          updateChannelRequest
        );
      } catch (err) {
        const createChannelRequest = {
          notificationChannel: {
            name: channel,
            notificationChannel: {
              type: 'email',
            },
          },
        };
        const newChannel = await notificationClient.createNotificationChannel(
          createChannelRequest
        );
        notificationChannels.push(newChannel);
      }
    }

    const updateAlertPolicyRequest = {
      updateMask: {
        paths: ['notification_channels'],
      },
      alertPolicy: {
        name: alertClient.projectAlertPolicyPath(projectId, alertPolicyId),
        notificationChannels: notificationChannels,
      },
    };
    const [alertPolicy] = await alertClient.updateAlertPolicy(
      updateAlertPolicyRequest
    );
    console.log(`Updated ${alertPolicy.name}.`);
  }
  replaceChannels();
  // [END monitoring_alert_replace_channels]
  // [END monitoring_alert_enable_channel]
  // [END monitoring_alert_update_channel]
  // [END monitoring_alert_create_channel]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
