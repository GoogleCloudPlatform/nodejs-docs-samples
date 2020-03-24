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
/**
 * Recognizes and annotates logos and brand marks in a video.
 * @param {string} inputUri video file to annotate
 */
function main(inputUri = 'gs://cloud-samples-data/video/googlework_short.mp4') {
  // [START video_detect_logo_gcs]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const inputUri = 'gs://cloud-samples-data/video/googlework_short.mp4';

  // Imports the Google Cloud client libraries
  const Video = require('@google-cloud/video-intelligence');

  // Instantiates a client
  const client = new Video.VideoIntelligenceServiceClient();

  // Performs asynchronous video annotation for logo recognition on a file hosted in GCS.
  async function detectLogoGcs() {
    // Build the request with the input uri and logo recognition feature.
    const request = {
      inputUri: inputUri,
      features: ['LOGO_RECOGNITION'],
    };

    // Make the asynchronous request
    const [operation] = await client.annotateVideo(request);

    // Wait for the results
    const [response] = await operation.promise();

    // Get the first response, since we sent only one video.
    const annotationResult = response.annotationResults[0];
    for (const logoRecognitionAnnotation of annotationResult.logoRecognitionAnnotations) {
      const entity = logoRecognitionAnnotation.entity;
      // Opaque entity ID. Some IDs may be available in
      // [Google Knowledge Graph Search API](https://developers.google.com/knowledge-graph/).
      console.log(`Entity Id: ${entity.entityId}`);
      console.log(`Description: ${entity.description}`);

      // All logo tracks where the recognized logo appears.
      // Each track corresponds to one logo instance appearing in consecutive frames.
      for (const track of logoRecognitionAnnotation.tracks) {
        console.log(
          `\n\tStart Time Offset: ${track.segment.startTimeOffset.seconds}.${track.segment.startTimeOffset.nanos}`
        );
        console.log(
          `\tEnd Time Offset: ${track.segment.endTimeOffset.seconds}.${track.segment.endTimeOffset.nanos}`
        );
        console.log(`\tConfidence: ${track.confidence}`);

        // The object with timestamp and attributes per frame in the track.
        for (const timestampedObject of track.timestampedObjects) {
          // Normalized Bounding box in a frame, where the object is located.
          const normalizedBoundingBox = timestampedObject.normalizedBoundingBox;
          console.log(`\n\t\tLeft: ${normalizedBoundingBox.left}`);
          console.log(`\t\tTop: ${normalizedBoundingBox.top}`);
          console.log(`\t\tRight: ${normalizedBoundingBox.right}`);
          console.log(`\t\tBottom: ${normalizedBoundingBox.bottom}`);
          // Optional. The attributes of the object in the bounding box.
          for (const attribute of timestampedObject.attributes) {
            console.log(`\n\t\t\tName: ${attribute.name}`);
            console.log(`\t\t\tConfidence: ${attribute.confidence}`);
            console.log(`\t\t\tValue: ${attribute.value}`);
          }
        }

        // Optional. Attributes in the track level.
        for (const trackAttribute of track.attributes) {
          console.log(`\n\t\tName: ${trackAttribute.name}`);
          console.log(`\t\tConfidence: ${trackAttribute.confidence}`);
          console.log(`\t\tValue: ${trackAttribute.value}`);
        }
      }

      // All video segments where the recognized logo appears.
      // There might be multiple instances of the same logo class appearing in one VideoSegment.
      for (const segment of logoRecognitionAnnotation.segments) {
        console.log(
          `\n\tStart Time Offset: ${segment.startTimeOffset.seconds}.${segment.startTimeOffset.nanos}`
        );
        console.log(
          `\tEnd Time Offset: ${segment.endTimeOffset.seconds}.${segment.endTimeOffset.nanos}`
        );
      }
    }
  }

  detectLogoGcs();
  // [END video_detect_logo_gcs]
}

main(...process.argv.slice(2));
