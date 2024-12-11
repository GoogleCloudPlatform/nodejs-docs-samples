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

function main(projectId, location, channelId, clipId) {
  // [START livestream_get_channel_clip]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // channelId = 'my-channel';
  // clipId = 'my-channel-clip';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function getChannelClip() {
    // Construct request
    const request = {
      name: livestreamServiceClient.clipPath(
        projectId,
        location,
        channelId,
        clipId
      ),
    };
    const [clip] = await livestreamServiceClient.getClip(request);
    console.log(`Channel clip: ${clip.name}`);
  }

  getChannelClip();
  // [END livestream_get_channel_clip]
}

// node getChannelClip.js <projectId> <location> <channelId> <clipId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
