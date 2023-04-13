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

function main(
  projectId,
  location,
  inputVideoUri,
  inputSubtitles1Uri,
  inputSubtitles2Uri,
  outputUri
) {
  // [START transcoder_create_job_with_standalone_captions]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // inputVideoUri = 'gs://my-bucket/my-video-file';
  // inputSubtitles1Uri = 'gs://my-bucket/my-captions-file1';
  // inputSubtitles2Uri = 'gs://my-bucket/my-captions-file2';
  // outputUri = 'gs://my-bucket/my-output-folder/';

  // Imports the Transcoder library
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function createJobWithStandaloneCaptions() {
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
              key: 'subtitle_input_en',
              uri: inputSubtitles1Uri,
            },
            {
              key: 'subtitle_input_es',
              uri: inputSubtitles2Uri,
            },
          ],
          editList: [
            {
              key: 'atom0',
              inputs: ['input0', 'subtitle_input_en', 'subtitle_input_es'],
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
              key: 'vtt-stream-en',
              textStream: {
                codec: 'webvtt',
                languageCode: 'en-US',
                displayName: 'English',
                mapping: [
                  {
                    atomKey: 'atom0',
                    inputKey: 'subtitle_input_en',
                  },
                ],
              },
            },
            {
              key: 'vtt-stream-es',
              textStream: {
                codec: 'webvtt',
                languageCode: 'es-ES',
                displayName: 'Spanish',
                mapping: [
                  {
                    atomKey: 'atom0',
                    inputKey: 'subtitle_input_es',
                  },
                ],
              },
            },
          ],
          muxStreams: [
            {
              key: 'sd-hls-fmp4',
              container: 'fmp4',
              elementaryStreams: ['video-stream0'],
            },
            {
              key: 'audio-hls-fmp4',
              container: 'fmp4',
              elementaryStreams: ['audio-stream0'],
            },
            {
              key: 'text-vtt-en',
              container: 'vtt',
              elementaryStreams: ['vtt-stream-en'],
              segmentSettings: {
                segmentDuration: {
                  seconds: 6,
                },
                individualSegments: true,
              },
            },
            {
              key: 'text-vtt-es',
              container: 'vtt',
              elementaryStreams: ['vtt-stream-es'],
              segmentSettings: {
                segmentDuration: {
                  seconds: 6,
                },
                individualSegments: true,
              },
            },
          ],
          manifests: [
            {
              fileName: 'manifest.m3u8',
              type: 'HLS',
              muxStreams: [
                'sd-hls-fmp4',
                'audio-hls-fmp4',
                'text-vtt-en',
                'text-vtt-es',
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

  createJobWithStandaloneCaptions();
  // [END transcoder_create_job_with_standalone_captions]
}

// node createJobWithStandaloneCaptions.js <projectId> <location> <inputVideoUri> <inputSubtitles1Uri> <inputSubtitles2Uri> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
