/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://cloud.google.com/video-intelligence/docs/

'use strict';

function analyzeFaces (gcsPath) {
  // [START analyze_faces]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/videointelligence').v1beta1();

  // Instantiates a client
  const video = Video.videoIntelligenceServiceClient();

  // The GCS filepath of the video to analyze
  // const gcsPath = 'gs://my-bucket/my-video.mp4'

  const request = {
    inputUri: gcsPath,
    features: ['FACE_DETECTION']
  };

  // Detect faces in a video
  video.annotateVideo(request)
    .then((startResponse) => {
      const operation = startResponse[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((doneResponse) => {
      // Get faces for first video
      const faces = doneResponse[0].annotationResults[0].faceAnnotations;
      faces.forEach((face, faceIdx) => {
        console.log('Thumbnail size:', face.thumbnail.buffer.length);
        face.segments.forEach((segment, segmentIdx) => {
          console.log(`Track ${segmentIdx} of face ${faceIdx}: frames ${segment.startTimeOffset} to ${segment.endTimeOffset}`);
        });
      });
    });
  // [END analyze_faces]
}

function analyzeLabels (gcsPath) {
  // [START analyze_labels]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/videointelligence').v1beta1();

  // Instantiates a client
  const video = Video.videoIntelligenceServiceClient();

  // The GCS filepath of the video to analyze
  // const gcsPath = 'gs://my-bucket/my-video.mp4'

  const request = {
    inputUri: gcsPath,
    features: ['FACE_DETECTION']
  };

  // Detect labels in a video
  video.annotateVideo(request)
    .then((startResponse) => {
      const operation = startResponse[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((doneResponse) => {
      // Get labels for first video
      const labels = doneResponse[0].annotationResults[0].labelAnnotations;
      labels.forEach((label) => {
        console.log('Label description:', label.description);
        console.log('Locations:');
        label.locations.forEach((location) => {
          console.log(`\tFrames ${location.segment.startTimeOffset} to ${location.segment.endTimeOffset}`);
        });
      });
    });
  // [END analyze_labels]
}

function analyzeShots (gcsPath) {
  // [START analyze_shots]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/videointelligence').v1beta1();

  // Instantiates a client
  const video = Video.videoIntelligenceServiceClient();

  // The GCS filepath of the video to analyze
  // const gcsPath = 'gs://my-bucket/my-video.mp4'

  const request = {
    inputUri: gcsPath,
    features: ['FACE_DETECTION']
  };

  // Detect camera shot changes
  video.annotateVideo(request)
    .then((startResponse) => {
      const operation = startResponse[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((doneResponse) => {
      // Get shot changes for first video
      const shotChanges = doneResponse[0].annotationResults[0].shotAnnotations;
      shotChanges.forEach((shot, shotIdx) => {
        console.log(`Scene ${shotIdx}:`);
        console.log(`\tStart: ${shot.startTimeOffset}`);
        console.log(`\tEnd: ${shot.endTimeOffset}`);
      });
    });
  // [END analyze_shots]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `faces <gcsPath>`,
    `Analyzes faces in a video using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeFaces(opts.gcsPath)
  )
  .command(
    `shots <gcsPath>`,
    `Analyzes shot angles in a video using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeShots(opts.gcsPath)
  )
  .command(
    `labels <gcsPath>`,
    `Labels objects in a video using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeLabels(opts.gcsPath)
  )
  .example(`node $0 faces gs://my-bucket/my-video.mp4`)
  .example(`node $0 shots gs://my-bucket/my-video.mp4`)
  .example(`node $0 labels gs://my-bucket/my-video.mp4`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/video-intelligence/docs`);

if (module === require.main) {
  cli.help().strict().argv;
}
