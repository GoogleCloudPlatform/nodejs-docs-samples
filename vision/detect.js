/**
 * Copyright 2017, Google, Inc.
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

const Vision = require('@google-cloud/vision');
const Storage = require('@google-cloud/storage');

// [START vision_face_detection]
function detectFaces (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs face detection on the local file
  return vision.detectFaces(fileName)
    .then((results) => {
      const faces = results[0];

      console.log('Faces:');
      faces.forEach((face, i) => {
        console.log(`  Face #${i + 1}:`);
        console.log(`    Joy: ${face.joy}`);
        console.log(`    Anger: ${face.anger}`);
        console.log(`    Sorrow: ${face.sorrow}`);
        console.log(`    Surprise: ${face.surprise}`);
      });

      return faces;
    });
}
// [END vision_face_detection]

// [START vision_face_detection_gcs]
function detectFacesGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs face detection on the remote file
  return vision.detectFaces(file)
    .then((results) => {
      const faces = results[0];

      console.log('Faces:');
      faces.forEach((face, i) => {
        console.log(`  Face #${i + 1}:`);
        console.log(`    Joy: ${face.joy}`);
        console.log(`    Anger: ${face.anger}`);
        console.log(`    Sorrow: ${face.sorrow}`);
        console.log(`    Surprise: ${face.surprise}`);
      });

      return faces;
    });
}
// [END vision_face_detection_gcs]

// [START vision_label_detection]
function detectLabels (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs label detection on the local file
  return vision.detectLabels(fileName)
    .then((results) => {
      const labels = results[0];

      console.log('Labels:');
      labels.forEach((label) => console.log(label));

      return labels;
    });
}
// [END vision_label_detection]

// [START vision_label_detection_gcs]
function detectLabelsGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs label detection on the remote file
  return vision.detectLabels(file)
    .then((results) => {
      const labels = results[0];

      console.log('Labels:');
      labels.forEach((label) => console.log(label));

      return labels;
    });
}
// [END vision_label_detection_gcs]

// [START vision_landmark_detection]
function detectLandmarks (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs landmark detection on the local file
  return vision.detectLandmarks(fileName)
    .then((results) => {
      const landmarks = results[0];

      console.log('Landmarks:');
      landmarks.forEach((landmark) => console.log(landmark));

      return landmarks;
    });
}
// [END vision_landmark_detection]

// [START vision_landmark_detection_gcs]
function detectLandmarksGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs landmark detection on the remote file
  return vision.detectLandmarks(file)
    .then((results) => {
      const landmarks = results[0];

      console.log('Landmarks:');
      landmarks.forEach((landmark) => console.log(landmark));

      return landmarks;
    });
}
// [END vision_landmark_detection_gcs]

// [START vision_text_detection]
function detectText (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs text detection on the local file
  return vision.detectText(fileName)
    .then((results) => {
      const detections = results[0];

      console.log('Text:');
      detections.forEach((text) => console.log(text));

      return detections;
    });
}
// [END vision_text_detection]

// [START vision_text_detection_gcs]
function detectTextGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs text detection on the remote file
  return vision.detectText(file)
    .then((results) => {
      const detections = results[0];

      console.log('Text:');
      detections.forEach((text) => console.log(text));

      return detections;
    });
}
// [END vision_text_detection_gcs]

// [START vision_logo_detection]
function detectLogos (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs logo detection on the local file
  return vision.detectLogos(fileName)
    .then((results) => {
      const logos = results[0];

      console.log('Logos:');
      logos.forEach((logo) => console.log(logo));

      return logos;
    });
}
// [END vision_logo_detection]

// [START vision_logo_detection_gcs]
function detectLogosGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs logo detection on the remote file
  return vision.detectLogos(file)
    .then((results) => {
      const logos = results[0];

      console.log('Logos:');
      logos.forEach((logo) => console.log(logo));

      return logos;
    });
}
// [END vision_logo_detection_gcs]

// [START vision_image_property_detection]
function detectProperties (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs image property detection on the local file
  return vision.detectProperties(fileName)
    .then((results) => {
      const properties = results[0];

      console.log('Colors:');
      properties.colors.forEach((color) => console.log(color));

      return properties;
    });
}
// [END vision_image_property_detection]

// [START vision_image_property_detection_gcs]
function detectPropertiesGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs image property detection on the remote file
  return vision.detectProperties(file)
    .then((results) => {
      const properties = results[0];

      console.log('Colors:');
      properties.colors.forEach((color) => console.log(color));

      return properties;
    });
}
// [END vision_image_property_detection_gcs]

// [START vision_safe_search_detection]
function detectSafeSearch (fileName) {
  // Instantiates a client
  const vision = Vision();

  // Performs safe search property detection on the local file
  return vision.detectSafeSearch(fileName)
    .then((results) => {
      const detections = results[0];

      console.log(`Adult: ${detections.adult}`);
      console.log(`Spoof: ${detections.spoof}`);
      console.log(`Medical: ${detections.medical}`);
      console.log(`Violence: ${detections.violence}`);

      return detections;
    });
}
// [END vision_safe_search_detection]

// [START vision_safe_search_detection_gcs]
function detectSafeSearchGCS (bucketName, fileName) {
  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The image file to analyze, e.g. "image.jpg"
  const file = bucket.file(fileName);

  // Performs safe search property detection on the remote file
  return vision.detectSafeSearch(file)
    .then((results) => {
      const detections = results[0];

      console.log(`Adult: ${detections.adult}`);
      console.log(`Spoof: ${detections.spoof}`);
      console.log(`Medical: ${detections.medical}`);
      console.log(`Violence: ${detections.violence}`);

      return detections;
    });
}
// [END vision_safe_search_detection_gcs]

require(`yargs`)
  .demand(1)
  .command(
    `faces <fileName>`,
    `Detects faces in a local image file.`,
    {},
    (opts) => detectFaces(opts.fileName)
  )
  .command(
    `faces-gcs <bucket> <fileName>`,
    `Detects faces in an image in Google Cloud Storage.`,
    {},
    (opts) => detectFacesGCS(opts.bucket, opts.fileName)
  )
  .command(
    `labels <fileName>`,
    `Detects labels in a local image file.`,
    {},
    (opts) => detectLabels(opts.fileName)
  )
  .command(
    `labels-gcs <bucket> <fileName>`,
    `Detects labels in an image in Google Cloud Storage.`,
    {},
    (opts) => detectLabelsGCS(opts.bucket, opts.fileName)
  )
  .command(
    `landmarks <fileName>`,
    `Detects landmarks in a local image file.`,
    {},
    (opts) => detectLandmarks(opts.fileName)
  )
  .command(
    `landmarks-gcs <bucket> <fileName>`,
    `Detects landmarks in an image in Google Cloud Storage.`,
    {},
    (opts) => detectLandmarksGCS(opts.bucket, opts.fileName)
  )
  .command(
    `text <fileName>`,
    `Detects text in a local image file.`,
    {},
    (opts) => detectText(opts.fileName)
  )
  .command(
    `text-gcs <bucket> <fileName>`,
    `Detects text in an image in Google Cloud Storage.`,
    {},
    (opts) => detectTextGCS(opts.bucket, opts.fileName)
  )
  .command(
    `logos <fileName>`,
    `Detects logos in a local image file.`,
    {},
    (opts) => detectLogos(opts.fileName)
  )
  .command(
    `logos-gcs <bucket> <fileName>`,
    `Detects logos in an image in Google Cloud Storage.`,
    {},
    (opts) => detectLogosGCS(opts.bucket, opts.fileName)
  )
  .command(
    `properties <fileName>`,
    `Detects image properties in a local image file.`,
    {},
    (opts) => detectProperties(opts.fileName)
  )
  .command(
    `properties-gcs <bucket> <fileName>`,
    `Detects image properties in an image in Google Cloud Storage.`,
    {},
    (opts) => detectPropertiesGCS(opts.bucket, opts.fileName)
  )
  .command(
    `safe-search <fileName>`,
    `Detects safe search properties in a local image file.`,
    {},
    (opts) => detectSafeSearch(opts.fileName)
  )
  .command(
    `safe-search-gcs <bucket> <fileName>`,
    `Detects safe search properties in an image in Google Cloud Storage.`,
    {},
    (opts) => detectSafeSearchGCS(opts.bucket, opts.fileName)
  )
  .example(`node $0 faces ./resources/face_no_surprise.jpg`)
  .example(`node $0 faces-gcs my-bucket your-image.jpg`)
  .example(`node $0 labels ./resources/wakeupcat.jpg`)
  .example(`node $0 labels-gcs my-bucket your-image.jpg`)
  .example(`node $0 landmarks ./resources/landmark.jpg`)
  .example(`node $0 landmarks-gcs my-bucket your-image.jpg`)
  .example(`node $0 text ./resources/wakeupcat.jpg`)
  .example(`node $0 text-gcs my-bucket your-image.jpg`)
  .example(`node $0 logos ./resources/logos.png`)
  .example(`node $0 logos-gcs my-bucket your-image.jpg.png`)
  .example(`node $0 properties ./resources/landmark.jpg`)
  .example(`node $0 properties-gcs my-bucket your-image.jpg`)
  .example(`node $0 safe-search ./resources/wakeupcat.jpg`)
  .example(`node $0 safe-search-gcs my-bucket your-image.jpg`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict()
  .argv;
