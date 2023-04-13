/**
 * Copyright 2022 Google LLC
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

function main(projectId, location, inputVideoUri, inputCaptionsUri, outputUri) {
  // [START transcoder_create_job_with_embedded_captions]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // inputVideoUri = 'gs://my-bucket/my-video-file';
  // inputCaptionsUri = 'gs://my-bucket/my-captions-file';
  // outputUri = 'gs://my-bucket/my-output-folder/';

  // Imports the Transcoder library
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function createJobWithEmbeddedCaptions() {
    // Construct request
    const request = {
      parent: transcoderServiceClient.locationPath(projectId, location),
      job: {
        outputUri: outputUri,
        config: {
          inputs: [
            {
              key: 'input0',
              uri: inputVideoUri,
            },
            {
              key: 'caption_input0',
              uri: inputCaptionsUri,
            },
          ],
          editList: [
            {
              key: 'atom0',
              inputs: ['input0', 'caption_input0'],
            },
          ],
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
            {
              key: 'cea-stream0',
              textStream: {
                codec: 'cea608',
                mapping: [
                  {
                    atomKey: 'atom0',
                    inputKey: 'caption_input0',
                    inputTrack: 0,
                  },
                ],
                languageCode: 'en-US',
                displayName: 'English',
              },
            },
          ],
          muxStreams: [
            {
              key: 'sd-hls',
              container: 'ts',
              elementaryStreams: ['video-stream0', 'audio-stream0'],
            },
            {
              key: 'sd-dash',
              container: 'fmp4',
              elementaryStreams: ['video-stream0'],
            },
            {
              key: 'audio-dash',
              container: 'fmp4',
              elementaryStreams: ['audio-stream0'],
            },
          ],
          manifests: [
            {
              fileName: 'manifest.m3u8',
              type: 'HLS',
              muxStreams: ['sd-hls'],
            },
            {
              fileName: 'manifest.mpd',
              type: 'DASH',
              muxStreams: ['sd-dash', 'audio-dash'],
            },
          ],
        },
      },
    };

    // Run request
    const [response] = await transcoderServiceClient.createJob(request);
    console.log(`Job: ${response.name}`);
  }

  createJobWithEmbeddedCaptions();
  // [END transcoder_create_job_with_embedded_captions]
}

// node createJobWithEmbeddedCaptions.js <projectId> <location> <inputVideoUri> <inputCaptionsUri> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
