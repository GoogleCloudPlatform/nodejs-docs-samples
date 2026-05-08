/**
 * Copyright 2022 Google LLC
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

function main(projectId, location, channelId, inputId, outputUri) {
  // [START livestream_create_channel]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // channelId = 'my-channel';
  // inputId = 'my-input';
  // outputUri = 'gs://my-bucket/my-output-folder/';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function createChannel() {
    // Construct request
    const request = {
      parent: livestreamServiceClient.locationPath(projectId, location),
      channelId: channelId,
      channel: {
        inputAttachments: [
          {
            key: 'my-input',
            input: livestreamServiceClient.inputPath(
              projectId,
              location,
              inputId
            ),
          },
        ],
        output: {
          uri: outputUri,
        },
        elementaryStreams: [
          {
            key: 'es_video',
            videoStream: {
              h264: {
                profile: 'high',
                heightPixels: 720,
                widthPixels: 1280,
                bitrateBps: 3000000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'es_audio',
            audioStream: {
              codec: 'aac',
              channelCount: 2,
              bitrateBps: 160000,
            },
          },
        ],
        muxStreams: [
          {
            key: 'mux_video',
            elementaryStreams: ['es_video'],
            segmentSettings: {
              seconds: 2,
            },
          },
          {
            key: 'mux_audio',
            elementaryStreams: ['es_audio'],
            segmentSettings: {
              seconds: 2,
            },
          },
        ],
        manifests: [
          {
            fileName: 'manifest.m3u8',
            type: 'HLS',
            key: 'manifest_hls',
            muxStreams: ['mux_video', 'mux_audio'],
            maxSegmentCount: 5,
          },
        ],
        // Optional, but required for VOD clips
        retentionConfig: {
          retentionWindowDuration: {
            seconds: 86400,
          },
        },
      },
    };

    // Run request
    const [operation] = await livestreamServiceClient.createChannel(request);
    const response = await operation.promise();
    const [channel] = response;
    console.log(`Channel: ${channel.name}`);
  }

  createChannel();
  // [END livestream_create_channel]
}

// node createChannel.js <projectId> <location> <channelId> <inputId> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
