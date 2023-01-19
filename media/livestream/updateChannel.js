/**
 * Copyright 2022, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function main(projectId, location, channelId, inputId) {
  // [START livestream_update_channel]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // channelId = 'my-channel';
  // inputId = 'my-input';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function updateChannel() {
    // Construct request
    const request = {
      channel: {
        name: livestreamServiceClient.channelPath(
          projectId,
          location,
          channelId
        ),
        inputAttachments: [
          {
            key: 'updated-input',
            input: livestreamServiceClient.inputPath(
              projectId,
              location,
              inputId
            ),
          },
        ],
      },
      updateMask: {
        paths: ['input_attachments'],
      },
    };

    // Run request
    const [operation] = await livestreamServiceClient.updateChannel(request);
    const response = await operation.promise();
    const [channel] = response;
    console.log(`Updated channel: ${channel.name}`);
  }

  updateChannel();
  // [END livestream_update_channel]
}

// node updateChannel.js <projectId> <location> <channelId> <inputId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
