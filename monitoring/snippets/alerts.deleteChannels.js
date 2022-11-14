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

function main(projectId, filter) {
  // [START monitoring_alert_delete_channel]
  // [START monitoring_alert_list_channels]

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.NotificationChannelServiceClient();

  async function deleteChannels() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const filter = 'A filter for selecting policies, e.g. description:"cloud"';

    const request = {
      name: client.projectPath(projectId),
      filter,
    };
    const channels = await client.listNotificationChannels(request);
    console.log(channels);
    for (const channel of channels[0]) {
      console.log(`Deleting channel ${channel.displayName}`);
      try {
        await client.deleteNotificationChannel({
          name: channel.name,
        });
      } catch (err) {
        // ignore error
      }
    }
  }
  deleteChannels();
  // [END monitoring_alert_delete_channel]
  // [END monitoring_alert_list_channels]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
