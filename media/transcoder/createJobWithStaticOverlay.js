/**
 * Copyright 2021 Google LLC
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

function main(projectId, location, inputUri, overlayImageUri, outputUri) {
  // [START transcoder_create_job_with_static_overlay]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // inputUri = 'gs://my-bucket/my-video-file';
  // overlayImageUri = 'gs://my-bucket/my-overlay-image-file';
  // outputUri = 'gs://my-bucket/my-output-folder/';

  // Imports the Transcoder library
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function createJobFromStaticOverlay() {
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
          overlays: [
            {
              image: {
                uri: overlayImageUri,
                resolution: {
                  x: 1,
                  y: 0.5,
                },
                alpha: 1.0,
              },
              animations: [
                {
                  animationStatic: {
                    xy: {
                      x: 0,
                      y: 0,
                    },
                    startTimeOffset: {
                      seconds: 0,
                    },
                  },
                },
                {
                  animationEnd: {
                    startTimeOffset: {
                      seconds: 10,
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    // Run request
    const [response] = await transcoderServiceClient.createJob(request);
    console.log(`Job: ${response.name}`);
  }

  createJobFromStaticOverlay();
  // [END transcoder_create_job_with_static_overlay]
}

// node createJobFromStaticOverlay.js <projectId> <location> <inputUri> <overlayImageUri> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
