/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function main(projectId, location, channelId, clipId, outputUri) {
  // [START livestream_create_channel_clip]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // channelId = 'my-channel';
  // clipId = 'my-channel-clip';
  // outputUri = 'gs://my-bucket/my-output-folder';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function createChannelClip() {
    // Create a 20 second clip starting 40 seconds ago
    const recent = new Date();
    recent.setSeconds(recent.getSeconds() - 20);
    const earlier = new Date();
    earlier.setSeconds(earlier.getSeconds() - 40);

    // Construct request
    const request = {
      parent: livestreamServiceClient.channelPath(
        projectId,
        location,
        channelId
      ),
      clipId: clipId,
      clip: {
        outputUri: outputUri,
        slices: [
          {
            timeSlice: {
              markinTime: {
                seconds: Math.floor(earlier.getTime() / 1000),
                nanos: earlier.getMilliseconds() * 1000000,
              },
              markoutTime: {
                seconds: Math.floor(recent.getTime() / 1000),
                nanos: recent.getMilliseconds() * 1000000,
              },
            },
          },
        ],
        clipManifests: [
          {
            manifestKey: 'manifest_hls',
          },
        ],
      },
    };

    // Run request
    const [operation] = await livestreamServiceClient.createClip(request);
    const response = await operation.promise();
    const [clip] = response;
    console.log(`Channel clip: ${clip.name}`);
  }

  createChannelClip();
  // [END livestream_create_channel_clip]
}

// node createChannelClip.js <projectId> <location> <channelId> <clipId> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
