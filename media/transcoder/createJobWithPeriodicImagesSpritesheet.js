/**
 * Copyright 2021, Google, Inc.
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

function main(projectId, location, inputUri, outputUri) {
  // [START transcoder_create_job_with_periodic_images_spritesheet]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // inputUri = 'gs://my-bucket/my-video-file';
  // outputUri = 'gs://my-bucket/my-output-folder/';

  // Imports the Transcoder library
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function createJobWithPeriodicImagesSpritesheet() {
    // Construct request
    const request = {
      parent: transcoderServiceClient.locationPath(projectId, location),
      job: {
        inputUri: inputUri,
        outputUri: outputUri,
        config: {
          elementaryStreams: [
            {
              key: 'video-stream0',
              videoStream: {
                h264: {
                  heightPixels: 360,
                  widthPixels: 640,
                  bitrateBps: 550000,
                  frameRate: 60,
                },
              },
            },
            {
              key: 'audio-stream0',
              audioStream: {
                codec: 'aac',
                bitrateBps: 64000,
              },
            },
          ],
          muxStreams: [
            {
              key: 'sd',
              container: 'mp4',
              elementaryStreams: ['video-stream0', 'audio-stream0'],
            },
          ],
          spriteSheets: [
            {
              filePrefix: 'small-sprite-sheet',
              spriteHeightPixels: 32,
              spriteWidthPixels: 64,
              interval: {
                seconds: 7,
              },
            },
            {
              filePrefix: 'large-sprite-sheet',
              spriteHeightPixels: 72,
              spriteWidthPixels: 128,
              interval: {
                seconds: 7,
              },
            },
          ],
        },
      },
    };

    // Run request
    const [response] = await transcoderServiceClient.createJob(request);
    console.log(`Job: ${response.name}`);
  }

  createJobWithPeriodicImagesSpritesheet();
  // [END transcoder_create_job_with_periodic_images_spritesheet]
}

// node createJobWithPeriodicImagesSpritesheet.js <projectId> <location> <inputUri> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
