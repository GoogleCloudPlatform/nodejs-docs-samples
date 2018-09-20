/**
 * Copyright 2016, Google, Inc.
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

// [START vision_face_detection_tutorial_imports]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
const vision = require('@google-cloud/vision');
// [END vision_face_detection_tutorial_imports]
// [START vision_face_detection_tutorial_client]
// Creates a client
const client = new vision.ImageAnnotatorClient();

const fs = require('fs');
// [END vision_face_detection_tutorial_client]

/**
 * Uses the Vision API to detect faces in the given file.
 */
// [START vision_face_detection_tutorial_send_request]
function detectFaces(inputFile, callback) {
  // Make a call to the Vision API to detect the faces
  const request = {image: {source: {filename: inputFile}}};
  client
    .faceDetection(request)
    .then(results => {
      const faces = results[0].faceAnnotations;
      const numFaces = faces.length;
      console.log('Found ' + numFaces + (numFaces === 1 ? ' face' : ' faces'));
      callback(null, faces);
    })
    .catch(err => {
      console.error('ERROR:', err);
      callback(err);
    });
}
// [END vision_face_detection_tutorial_send_request]

/**
 * Draws a polygon around the faces, then saves to outputFile.
 */
// [START vision_face_detection_tutorial_process_response]
function highlightFaces(inputFile, faces, outputFile, Canvas, callback) {
  fs.readFile(inputFile, (err, image) => {
    if (err) {
      return callback(err);
    }

    const Image = Canvas.Image;
    // Open the original image into a canvas
    const img = new Image();
    img.src = image;
    const canvas = new Canvas(img.width, img.height);
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);

    // Now draw boxes around all the faces
    context.strokeStyle = 'rgba(0,255,0,0.8)';
    context.lineWidth = '5';

    faces.forEach(face => {
      context.beginPath();
      let origX = 0;
      let origY = 0;
      face.boundingPoly.vertices.forEach((bounds, i) => {
        if (i === 0) {
          origX = bounds.x;
          origY = bounds.y;
        }
        context.lineTo(bounds.x, bounds.y);
      });
      context.lineTo(origX, origY);
      context.stroke();
    });

    // Write the result to a file
    console.log('Writing to file ' + outputFile);
    const writeStream = fs.createWriteStream(outputFile);
    const pngStream = canvas.pngStream();

    pngStream.on('data', chunk => {
      writeStream.write(chunk);
    });
    pngStream.on('error', console.log);
    pngStream.on('end', callback);
  });
}
// [END vision_face_detection_tutorial_process_response]

// Run the example
// [START vision_face_detection_tutorial_run_application]
function main(inputFile, outputFile, Canvas, callback) {
  outputFile = outputFile || 'out.png';
  detectFaces(inputFile, (err, faces) => {
    if (err) {
      return callback(err);
    }

    console.log('Highlighting...');
    highlightFaces(inputFile, faces, outputFile, Canvas, err => {
      if (err) {
        return callback(err);
      }
      console.log('Finished!');
      callback(null, faces);
    });
  });
}
// [END vision_face_detection_tutorial_run_application]

exports.main = main;

if (module === require.main) {
  if (process.argv.length < 3) {
    console.log('Usage: node faceDetection <inputFile> [outputFile]');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];
  exports.main(inputFile, outputFile, require('canvas'), console.log);
}
