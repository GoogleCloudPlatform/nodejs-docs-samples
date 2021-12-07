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
  // [START video_detect_person_gcs]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const Video = require('@google-cloud/video-intelligence').v1;

  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  async function detectPersonGCS() {
    const request = {
      inputUri: gcsUri,
      features: ['PERSON_DETECTION'],
      videoContext: {
        personDetectionConfig: {
          // Must set includeBoundingBoxes to true to get poses and attributes.
          includeBoundingBoxes: true,
          includePoseLandmarks: true,
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
    const personAnnotations =
      results[0].annotationResults[0].personDetectionAnnotations;

    for (const {tracks} of personAnnotations) {
      console.log('Person detected:');

      for (const {segment, timestampedObjects} of tracks) {
        console.log(
          `\tStart: ${segment.startTimeOffset.seconds}` +
            `.${(segment.startTimeOffset.nanos / 1e6).toFixed(0)}s`
        );
        console.log(
          `\tEnd: ${segment.endTimeOffset.seconds}.` +
            `${(segment.endTimeOffset.nanos / 1e6).toFixed(0)}s`
        );

        // Each segment includes timestamped objects that
        // include characteristic--e.g. clothes, posture
        // of the person detected.
        const [firstTimestampedObject] = timestampedObjects;

        // Attributes include unique pieces of clothing, poses (i.e., body
        // landmarks) of the person detected.
        for (const {name, value} of firstTimestampedObject.attributes) {
          console.log(`\tAttribute: ${name}; Value: ${value}`);
        }

        // Landmarks in person detection include body parts.
        for (const {name, point} of firstTimestampedObject.landmarks) {
          console.log(`\tLandmark: ${name}; Vertex: ${point.x}, ${point.y}`);
        }
      }
    }
  }

  detectPersonGCS();
  // [END video_detect_person_gcs]
}

main(...process.argv.slice(2));
