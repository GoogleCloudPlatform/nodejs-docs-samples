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

'use strict';

function analyzeFaces (gcsUri) {
  // [START analyze_faces]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/videointelligence').v1beta1();

  // Instantiates a client
  const video = Video.videoIntelligenceServiceClient();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4'

  const request = {
    inputUri: gcsUri,
    features: ['FACE_DETECTION']
  };

  // Detects faces in a video
  video.annotateVideo(request)
    .then((results) => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((results) => {
      // Gets faces for first video
      const faces = results[0].annotationResults[0].faceAnnotations;
      faces.forEach((face, faceIdx) => {
        console.log('Thumbnail size:', face.thumbnail.buffer.length);
        face.segments.forEach((segment, segmentIdx) => {
          console.log(`Track ${segmentIdx} of face ${faceIdx}: frames ${segment.startTimeOffset} to ${segment.endTimeOffset}`);
        });
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_faces]
}

function analyzeLabels (gcsUri) {
  // [START analyze_labels]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/videointelligence').v1beta1();

  // Instantiates a client
  const video = Video.videoIntelligenceServiceClient();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4'

  const request = {
    inputUri: gcsUri,
    features: ['LABEL_DETECTION']
  };

  // Detects labels in a video
  video.annotateVideo(request)
    .then((results) => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((results) => {
      // Gets labels for first video
      const labels = results[0].annotationResults[0].labelAnnotations;
      labels.forEach((label) => {
        console.log('Label description:', label.description);
        console.log('Locations:');
        label.locations.forEach((location) => {
          console.log(`\tFrames ${location.segment.startTimeOffset} to ${location.segment.endTimeOffset}`);
        });
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_labels]
}

function analyzeShots (gcsUri) {
  // [START analyze_shots]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/videointelligence').v1beta1();

  // Instantiates a client
  const video = Video.videoIntelligenceServiceClient();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4'

  const request = {
    inputUri: gcsUri,
    features: ['SHOT_CHANGE_DETECTION']
  };

  // Detects camera shot changes
  video.annotateVideo(request)
    .then((results) => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((results) => {
      // Gets shot changes for first video
      const shotChanges = results[0].annotationResults[0].shotAnnotations;
      shotChanges.forEach((shot, shotIdx) => {
        console.log(`Scene ${shotIdx}:`);
        console.log(`\tStart: ${shot.startTimeOffset}`);
        console.log(`\tEnd: ${shot.endTimeOffset}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_shots]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `faces <gcsUri>`,
    `Analyzes faces in a video using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeFaces(opts.gcsUri)
  )
  .command(
    `shots <gcsUri>`,
    `Analyzes shot angles in a video using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeShots(opts.gcsUri)
  )
  .command(
    `labels <gcsUri>`,
    `Labels objects in a video using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeLabels(opts.gcsUri)
  )
  .example(`node $0 faces gs://my-bucket/my-video.mp4`)
  .example(`node $0 shots gs://my-bucket/my-video.mp4`)
  .example(`node $0 labels gs://my-bucket/my-video.mp4`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/video-intelligence/docs`)
  .help()
  .strict()
  .argv;
