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
  const Video = require('@google-cloud/video-intelligence');

  // Instantiates a client
  const video = Video();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4';

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
      // Gets faces
      const faces = results[0].annotationResults[0].faceAnnotations;
      console.log('Faces:');
      faces.forEach((face, faceIdx) => {
        console.log('Thumbnail size:', face.thumbnail.length);

        const isEntireVideo = face.segments.some((segment) =>
          segment.startTimeOffset.toNumber() === -1 &&
          segment.endTimeOffset.toNumber() === -1
        );

        if (isEntireVideo) {
          console.log(`Face #${faceIdx}`);
          console.log(`\tEntire video`);
        } else {
          face.segments.forEach((segment, segmentIdx) => {
            console.log(`Face #${faceIdx}, appearance #${segmentIdx}:`);
            console.log(`\tStart: ${segment.startTimeOffset / 1e6}s`);
            console.log(`\tEnd: ${segment.endTimeOffset / 1e6}s`);
          });
        }
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_faces]
}

function analyzeLabelsGCS (gcsUri) {
  // [START analyze_labels_gcs]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence');

  // Instantiates a client
  const video = Video();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4';

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
      // Gets labels
      const labels = results[0].annotationResults[0].labelAnnotations;
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`Label ${label.description} occurs at:`);
        const isEntireVideo = label.locations.some((location) =>
          location.segment.startTimeOffset.toNumber() === -1 &&
          location.segment.endTimeOffset.toNumber() === -1
        );

        if (isEntireVideo) {
          console.log(`\tEntire video`);
        } else {
          label.locations.forEach((location) => {
            console.log(`\tStart: ${location.segment.startTimeOffset / 1e6}s`);
            console.log(`\tEnd: ${location.segment.endTimeOffset / 1e6}s`);
          });
        }
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_labels_gcs]
}

function analyzeLabelsLocal (path) {
  // [START analyze_labels_local]
  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const Video = require('@google-cloud/video-intelligence');
  const fs = require('fs');

  // Instantiates a client
  const video = Video();

  // The local filepath of the video to analyze
  // const path = 'my-file.mp4';

  // Reads a local video file and converts it to base64
  const file = fs.readFileSync(path);
  const inputContent = file.toString('base64');

  // Constructs request
  const request = {
    inputContent: inputContent,
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
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`Label ${label.description} occurs at:`);
        const isEntireVideo = label.locations.some((location) =>
          location.segment.startTimeOffset.toNumber() === -1 &&
          location.segment.endTimeOffset.toNumber() === -1
        );

        if (isEntireVideo) {
          console.log(`\tEntire video`);
        } else {
          label.locations.forEach((location) => {
            console.log(`\tStart: ${location.segment.startTimeOffset / 1e6}s`);
            console.log(`\tEnd: ${location.segment.endTimeOffset / 1e6}s`);
          });
        }
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_labels_local]
}

function analyzeShots (gcsUri) {
  // [START analyze_shots]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence');

  // Instantiates a client
  const video = Video();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4';

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
      // Gets shot changes
      const shotChanges = results[0].annotationResults[0].shotAnnotations;
      console.log('Shot changes:');

      if (shotChanges.length === 1) {
        console.log(`The entire video is one shot.`);
      } else {
        shotChanges.forEach((shot, shotIdx) => {
          console.log(`Shot ${shotIdx} occurs from:`);
          console.log(`\tStart: ${shot.startTimeOffset / 1e6}s`);
          console.log(`\tEnd: ${shot.endTimeOffset / 1e6}s`);
        });
      }
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_shots]
}

function analyzeSafeSearch (gcsUri) {
  // [START analyze_safe_search]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence');

  // Instantiates a client
  const video = Video();

  // The GCS filepath of the video to analyze
  // const gcsUri = 'gs://my-bucket/my-video.mp4';

  const request = {
    inputUri: gcsUri,
    features: ['SAFE_SEARCH_DETECTION']
  };

  // Human-readable likelihoods
  const likelihoods = ['UNKNOWN', 'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];

  // Detects unsafe content
  video.annotateVideo(request)
    .then((results) => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then((results) => {
      // Gets unsafe content
      const safeSearchResults = results[0].annotationResults[0].safeSearchAnnotations;
      console.log('Safe search results:');
      safeSearchResults.forEach((result) => {
        console.log(`Time: ${result.timeOffset / 1e6}s`);
        console.log(`\tAdult: ${likelihoods[result.adult]}`);
        console.log(`\tSpoof: ${likelihoods[result.spoof]}`);
        console.log(`\tMedical: ${likelihoods[result.medical]}`);
        console.log(`\tViolent: ${likelihoods[result.violent]}`);
        console.log(`\tRacy: ${likelihoods[result.racy]}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END analyze_safe_search]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `faces <gcsUri>`,
    `Analyzes faces in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeFaces(opts.gcsUri)
  )
  .command(
    `shots <gcsUri>`,
    `Analyzes shot angles in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeShots(opts.gcsUri)
  )
  .command(
    `labels-gcs <gcsUri>`,
    `Labels objects in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeLabelsGCS(opts.gcsUri)
  )
  .command(
    `labels-file <gcsUri>`,
    `Labels objects in a video stored locally using the Cloud Video Intelligence API.`,
    {},
    (opts) => analyzeLabelsLocal(opts.gcsUri)
  )
  .command(
    `safe-search <gcsUri>`,
    `Detects adult content in a video stored in Google Cloud Storage.`,
    {},
    (opts) => analyzeSafeSearch(opts.gcsUri)
  )
  .example(`node $0 faces gs://demomaker/larry_sergey_ice_bucket_short.mp4`)
  .example(`node $0 shots gs://demomaker/sushi.mp4`)
  .example(`node $0 labels-gcs gs://demomaker/tomatoes.mp4`)
  .example(`node $0 labels-file cat.mp4`)
  .example(`node $0 safe-search gs://demomaker/tomatoes.mp4`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/video-intelligence/docs`)
  .help()
  .strict()
  .argv;
