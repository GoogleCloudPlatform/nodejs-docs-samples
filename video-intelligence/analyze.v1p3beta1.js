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

async function detectPerson(path) {
  //[START video_detect_person_beta]
  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const Video = require('@google-cloud/video-intelligence').v1p3beta1;
  const fs = require('fs');
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';

  // Reads a local video file and converts it to base64
  const file = fs.readFileSync(path);
  const inputContent = file.toString('base64');

  const request = {
    inputContent: inputContent,
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
  // Detects people in a video
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');

  // Gets annotations for video
  const personAnnotations =
    results[0].annotationResults[0].personDetectionAnnotations;

  for (const {tracks} of personAnnotations) {
    console.log('Person detected:');
    for (const {segment, timestampedObjects} of tracks) {
      if (segment.startTimeOffset.seconds === undefined) {
        segment.startTimeOffset.seconds = 0;
      }
      if (segment.startTimeOffset.nanos === undefined) {
        segment.startTimeOffset.nanos = 0;
      }
      if (segment.endTimeOffset.seconds === undefined) {
        segment.endTimeOffset.seconds = 0;
      }
      if (segment.endTimeOffset.nanos === undefined) {
        segment.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${segment.startTimeOffset.seconds}.` +
          `${(segment.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${segment.endTimeOffset.seconds}.` +
          `${(segment.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );

      // Each segment includes timestamped objects that
      // include characteristic--e.g. clothes, posture
      // of the person detected.
      const [firstTimestampedObject] = timestampedObjects;

      // Attributes include unique pieces of clothing,
      // poses, or hair color.
      for (const {name, value} of firstTimestampedObject.attributes) {
        console.log(`\tAttribute: ${name}; ` + `Value: ${value}`);
      }

      // Landmarks in person detection include body parts.
      for (const {name, point} of firstTimestampedObject.landmarks) {
        console.log(`\tLandmark: ${name}; Vertex: ${point.x}, ${point.y}`);
      }
    }
  }
  // [END video_detect_person_beta]
}
async function detectPersonGCS(gcsUri) {
  //[START video_detect_person_gcs_beta]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence').v1p3beta1;
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

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
  // Detects people in a video
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');

  // Gets annotations for video
  const personAnnotations =
    results[0].annotationResults[0].personDetectionAnnotations;

  for (const {tracks} of personAnnotations) {
    console.log('Person detected:');

    for (const {segment, timestampedObjects} of tracks) {
      if (segment.startTimeOffset.seconds === undefined) {
        segment.startTimeOffset.seconds = 0;
      }
      if (segment.startTimeOffset.nanos === undefined) {
        segment.startTimeOffset.nanos = 0;
      }
      if (segment.endTimeOffset.seconds === undefined) {
        segment.endTimeOffset.seconds = 0;
      }
      if (segment.endTimeOffset.nanos === undefined) {
        segment.endTimeOffset.nanos = 0;
      }
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

      // Attributes include unique pieces of clothing,
      // poses, or hair color.
      for (const {name, value} of firstTimestampedObject.attributes) {
        console.log(`\tAttribute: ${name}; ` + `Value: ${value}`);
      }

      // Landmarks in person detection include body parts.
      for (const {name, point} of firstTimestampedObject.landmarks) {
        console.log(`\tLandmark: ${name}; Vertex: ${point.x}, ${point.y}`);
      }
    }
  }
  // [END video_detect_person_gcs_beta]
}
async function detectFaces(path) {
  //[START video_detect_faces_beta]
  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const Video = require('@google-cloud/video-intelligence').v1p3beta1;
  const fs = require('fs');
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';

  // Reads a local video file and converts it to base64
  const file = fs.readFileSync(path);
  const inputContent = file.toString('base64');

  const request = {
    inputContent: inputContent,
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
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');

  // Gets annotations for video
  const faceAnnotations =
    results[0].annotationResults[0].faceDetectionAnnotations;

  for (const {tracks} of faceAnnotations) {
    console.log('Face detected:');
    for (const {segment, timestampedObjects} of tracks) {
      if (segment.startTimeOffset.seconds === undefined) {
        segment.startTimeOffset.seconds = 0;
      }
      if (segment.startTimeOffset.nanos === undefined) {
        segment.startTimeOffset.nanos = 0;
      }
      if (segment.endTimeOffset.seconds === undefined) {
        segment.endTimeOffset.seconds = 0;
      }
      if (segment.endTimeOffset.nanos === undefined) {
        segment.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${segment.startTimeOffset.seconds}` +
          `.${(segment.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${segment.endTimeOffset.seconds}.` +
          `${(segment.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );

      // Each segment includes timestamped objects that
      // include characteristics of the face detected.
      const [firstTimestapedObject] = timestampedObjects;

      for (const {name} of firstTimestapedObject.attributes) {
        // Attributes include unique pieces of clothing, like glasses,
        // poses, or hair color.
        console.log(`\tAttribute: ${name}; `);
      }
    }
  }
  //[END video_detect_faces_beta]
}
async function detectFacesGCS(gcsUri) {
  //[START video_detect_faces_gcs_beta]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence').v1p3beta1;
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

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
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');

  // Gets annotations for video
  const faceAnnotations =
    results[0].annotationResults[0].faceDetectionAnnotations;

  for (const {tracks} of faceAnnotations) {
    console.log('Face detected:');

    for (const {segment, timestampedObjects} of tracks) {
      if (segment.startTimeOffset.seconds === undefined) {
        segment.startTimeOffset.seconds = 0;
      }
      if (segment.startTimeOffset.nanos === undefined) {
        segment.startTimeOffset.nanos = 0;
      }
      if (segment.endTimeOffset.seconds === undefined) {
        segment.endTimeOffset.seconds = 0;
      }
      if (segment.endTimeOffset.nanos === undefined) {
        segment.endTimeOffset.nanos = 0;
      }
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
        // Attributes include unique pieces of clothing, like glasses,
        // poses, or hair color.
        console.log(`\tAttribute: ${name}; `);
      }
    }
  }
  //[END video_detect_faces_gcs_beta]
}

async function main() {
  require(`yargs`)
    .demand(1)
    .command(
      `video-person-gcs <gcsUri>`,
      `Detects people in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
      {},
      opts => detectPersonGCS(opts.gcsUri)
    )
    .command(
      `video-person <path>`,
      `Detects people in a video stored in a local file using the Cloud Video Intelligence API.`,
      {},
      opts => detectPerson(opts.path)
    )
    .command(
      `video-faces-gcs <gcsUri>`,
      `Detects faces in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
      {},
      opts => detectFacesGCS(opts.gcsUri)
    )
    .command(
      `video-faces <path>`,
      `Detects faces in a video stored in a local file using the Cloud Video Intelligence API.`,
      {},
      opts => detectFaces(opts.path)
    )
    .example(`node $0 video-person ./resources/googlework_short.mp4`)
    .example(
      `node $0 video-person-gcs gs://cloud-samples-data/video/googlework_short.mp4`
    )
    .example(`node $0 video-faces ./resources/googlework_short.mp4`)
    .example(
      `node $0 video-faces-gcs gs://cloud-samples-data/video/googlework_short.mp4`
    )
    .wrap(120)
    .recommendCommands()
    .epilogue(
      `For more information, see https://cloud.google.com/video-intelligence/docs`
    )
    .help()
    .strict().argv;
}

main().catch(console.error);
