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

function main(
  projectId,
  location,
  inputUri1,
  startTimeOffset1,
  endTimeOffset1,
  inputUri2,
  startTimeOffset2,
  endTimeOffset2,
  outputUri
) {
  // [START transcoder_create_job_with_concatenated_inputs]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // inputUri1 = 'gs://my-bucket/my-video-file1';
  // startTimeOffset1 = 0;
  // endTimeOffset1 = 8.1;
  // inputUri2 = 'gs://my-bucket/my-video-file2';
  // startTimeOffset2 = 3.5;
  // endTimeOffset2 = 15;
  // outputUri = 'gs://my-bucket/my-output-folder/';

  function calcOffsetNanoSec(offsetValueFractionalSecs) {
    if (offsetValueFractionalSecs.toString().indexOf('.') !== -1) {
      return (
        1000000000 *
        Number('.' + offsetValueFractionalSecs.toString().split('.')[1])
      );
    }
    return 0;
  }
  const startTimeOffset1Sec = Math.trunc(startTimeOffset1);
  const startTimeOffset1NanoSec = calcOffsetNanoSec(startTimeOffset1);
  const endTimeOffset1Sec = Math.trunc(endTimeOffset1);
  const endTimeOffset1NanoSec = calcOffsetNanoSec(endTimeOffset1);

  const startTimeOffset2Sec = Math.trunc(startTimeOffset2);
  const startTimeOffset2NanoSec = calcOffsetNanoSec(startTimeOffset2);
  const endTimeOffset2Sec = Math.trunc(endTimeOffset2);
  const endTimeOffset2NanoSec = calcOffsetNanoSec(endTimeOffset2);

  // Imports the Transcoder library
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;

  // Instantiates a client
  const transcoderServiceClient = new TranscoderServiceClient();

  async function createJobWithConcatenatedInputs() {
    // Construct request
    const request = {
      parent: transcoderServiceClient.locationPath(projectId, location),
      job: {
        outputUri: outputUri,
        config: {
          inputs: [
            {
              key: 'input1',
              uri: inputUri1,
            },
            {
              key: 'input2',
              uri: inputUri2,
            },
          ],
          editList: [
            {
              key: 'atom1',
              inputs: ['input1'],
              startTimeOffset: {
                seconds: startTimeOffset1Sec,
                nanos: startTimeOffset1NanoSec,
              },
              endTimeOffset: {
                seconds: endTimeOffset1Sec,
                nanos: endTimeOffset1NanoSec,
              },
            },
            {
              key: 'atom2',
              inputs: ['input2'],
              startTimeOffset: {
                seconds: startTimeOffset2Sec,
                nanos: startTimeOffset2NanoSec,
              },
              endTimeOffset: {
                seconds: endTimeOffset2Sec,
                nanos: endTimeOffset2NanoSec,
              },
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
          ],
          muxStreams: [
            {
              key: 'sd',
              container: 'mp4',
              elementaryStreams: ['video-stream0', 'audio-stream0'],
            },
          ],
        },
      },
    };

    // Run request
    const [response] = await transcoderServiceClient.createJob(request);
    console.log(`Job: ${response.name}`);
  }

  createJobWithConcatenatedInputs();
  // [END transcoder_create_job_with_concatenated_inputs]
}

// node createJobFromStaticOverlay.js <projectId> <location> <inputUri1> <startTimeOffset1> <endTimeOffset1> <inputUri2> <startTimeOffset2> <endTimeOffset2> <outputUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
