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

function detectFaces (fileName) {
  // [START vision_face_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs face detection on the local file
  vision.detectFaces(fileName)
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
    });
  // [END vision_face_detection]
}

function detectFacesGCS (bucketName, fileName) {
  // [START vision_face_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs face detection on the remote file
  vision.detectFaces(storage.bucket(bucketName).file(fileName))
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
    });
  // [END vision_face_detection_gcs]
}

function detectLabels (fileName) {
  // [START vision_label_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs label detection on the local file
  vision.detectLabels(fileName)
    .then((results) => {
      const labels = results[0];

      console.log('Labels:');
      labels.forEach((label) => console.log(label));
    });
  // [END vision_label_detection]
}

function detectLabelsGCS (bucketName, fileName) {
  // [START vision_label_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs label detection on the remote file
  vision.detectLabels(storage.bucket(bucketName).file(fileName))
    .then((results) => {
      const labels = results[0];

      console.log('Labels:');
      labels.forEach((label) => console.log(label));
    });
  // [END vision_label_detection_gcs]
}

function detectLandmarks (fileName) {
  // [START vision_landmark_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs landmark detection on the local file
  vision.detectLandmarks(fileName)
    .then((results) => {
      const landmarks = results[0];

      console.log('Landmarks:');
      landmarks.forEach((landmark) => console.log(landmark));
    });
  // [END vision_landmark_detection]
}

function detectLandmarksGCS (bucketName, fileName) {
  // [START vision_landmark_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs landmark detection on the remote file
  vision.detectLandmarks(storage.bucket(bucketName).file(fileName))
    .then((results) => {
      const landmarks = results[0];

      console.log('Landmarks:');
      landmarks.forEach((landmark) => console.log(landmark));
    });
  // [END vision_landmark_detection_gcs]
}

function detectText (fileName) {
  // [START vision_text_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs text detection on the local file
  vision.detectText(fileName)
    .then((results) => {
      const detections = results[0];

      console.log('Text:');
      detections.forEach((text) => console.log(text));
    });
  // [END vision_text_detection]
}

function detectTextGCS (bucketName, fileName) {
  // [START vision_text_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs text detection on the remote file
  vision.detectText(storage.bucket(bucketName).file(fileName))
    .then((results) => {
      const detections = results[0];

      console.log('Text:');
      detections.forEach((text) => console.log(text));
    });
  // [END vision_text_detection_gcs]
}

function detectLogos (fileName) {
  // [START vision_logo_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs logo detection on the local file
  vision.detectLogos(fileName)
    .then((results) => {
      const logos = results[0];

      console.log('Logos:');
      logos.forEach((logo) => console.log(logo));
    });
  // [END vision_logo_detection]
}

function detectLogosGCS (bucketName, fileName) {
  // [START vision_logo_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs logo detection on the remote file
  vision.detectLogos(storage.bucket(bucketName).file(fileName))
    .then((results) => {
      const logos = results[0];

      console.log('Logos:');
      logos.forEach((logo) => console.log(logo));
    });
  // [END vision_logo_detection_gcs]
}

function detectProperties (fileName) {
  // [START vision_image_property_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs image property detection on the local file
  vision.detectProperties(fileName)
    .then((results) => {
      const properties = results[0];

      console.log('Colors:');
      properties.colors.forEach((color) => console.log(color));
    });
  // [END vision_image_property_detection]
}

function detectPropertiesGCS (bucketName, fileName) {
  // [START vision_image_property_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs image property detection on the remote file
  vision.detectProperties(storage.bucket(bucketName).file(fileName))
    .then((results) => {
      const properties = results[0];

      console.log('Colors:');
      properties.colors.forEach((color) => console.log(color));
    });
  // [END vision_image_property_detection_gcs]
}

function detectSafeSearch (fileName) {
  // [START vision_safe_search_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Instantiates a client
  const vision = Vision();

  // The path to the local image file, e.g. "/path/to/image.png"
  // const fileName = '/path/to/image.png';

  // Performs safe search property detection on the local file
  vision.detectSafeSearch(fileName)
    .then((results) => {
      const detections = results[0];

      console.log(`Adult: ${detections.adult}`);
      console.log(`Spoof: ${detections.spoof}`);
      console.log(`Medical: ${detections.medical}`);
      console.log(`Violence: ${detections.violence}`);
    });
  // [END vision_safe_search_detection]
}

function detectSafeSearchGCS (bucketName, fileName) {
  // [START vision_safe_search_detection_gcs]
  // Imports the Google Cloud client libraries
  const Storage = require('@google-cloud/storage');
  const Vision = require('@google-cloud/vision');

  // Instantiates clients
  const storage = Storage();
  const vision = Vision();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The path to the file within the bucket, e.g. "path/to/image.png"
  // const fileName = 'path/to/image.png';

  // Performs safe search property detection on the remote file
  vision.detectSafeSearch(storage.bucket(bucketName).file(fileName))
    .then((results) => {
      const detections = results[0];

      console.log(`Adult: ${detections.adult}`);
      console.log(`Spoof: ${detections.spoof}`);
      console.log(`Medical: ${detections.medical}`);
      console.log(`Violence: ${detections.violence}`);
    });
  // [END vision_safe_search_detection_gcs]
}

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
