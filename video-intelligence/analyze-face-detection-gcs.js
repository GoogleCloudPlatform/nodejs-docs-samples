// Copyright 2020 Google LLC
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

function main(gcsUri = 'YOUR_STORAGE_URI') {
  // [START video_detect_faces_gcs]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const Video = require('@google-cloud/video-intelligence').v1;

  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  async function detectFacesGCS() {
    const request = {
      inputUri: gcsUri,
      features: ['FACE_DETECTION'],
      videoContext: {
        faceDetectionConfig: {
          // Must set includeBoundingBoxes to true to get facial attributes.
          includeBoundingBoxes: true,
          includeAttributes: true,
        },
      },
    };
    // Detects faces in a video
    // We get the first result because we only process 1 video
    const [operation] = await video.annotateVideo(request);
    const results = await operation.promise();
    console.log('Waiting for operation to complete...');

    // Gets annotations for video
    const faceAnnotations =
      results[0].annotationResults[0].faceDetectionAnnotations;

    for (const {tracks} of faceAnnotations) {
      console.log('Face detected:');

      for (const {segment, timestampedObjects} of tracks) {
        console.log(
          `\tStart: ${segment.startTimeOffset.seconds}.` +
            `${(segment.startTimeOffset.nanos / 1e6).toFixed(0)}s`
        );
        console.log(
          `\tEnd: ${segment.endTimeOffset.seconds}.` +
            `${(segment.endTimeOffset.nanos / 1e6).toFixed(0)}s`
        );

        // Each segment includes timestamped objects that
        // include characteristics of the face detected.
        const [firstTimestapedObject] = timestampedObjects;

        for (const {name} of firstTimestapedObject.attributes) {
          // Attributes include 'glasses', 'headwear', 'smiling'.
          console.log(`\tAttribute: ${name}; `);
        }
      }
    }
  }

  detectFacesGCS();
  // [END video_detect_faces_gcs]
}

main(...process.argv.slice(2));
