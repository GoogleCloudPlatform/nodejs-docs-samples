// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START auth]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Vision = require('@google-cloud/vision');

// Instantiate a vision client
var vision = Vision();
// [END auth]

var fs = require('fs');

/**
 * Uses the Vision API to detect faces in the given file.
 */
function detectFaces (inputFile, callback) {
  // Make a call to the Vision API to detect the faces
  vision.detectFaces(inputFile, function (err, faces) {
    if (err) {
      return callback(err);
    }
    var numFaces = faces.length;
    console.log('Found ' + numFaces + (numFaces === 1 ? ' face' : ' faces'));
    callback(null, faces);
  });
}

/**
 * Draws a polygon around the faces, then saves to outputFile.
 */
function highlightFaces (inputFile, faces, outputFile, Canvas, callback) {
  fs.readFile(inputFile, function (err, image) {
    if (err) {
      return callback(err);
    }

    var Image = Canvas.Image;
    // Open the original image into a canvas
    var img = new Image();
    img.src = image;
    var canvas = new Canvas(img.width, img.height);
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);

    // Now draw boxes around all the faces
    context.strokeStyle = 'rgba(0,255,0,0.8)';
    context.lineWidth = '5';

    faces.forEach(function (face) {
      context.beginPath();
      face.bounds.face.forEach(function (bounds) {
        context.lineTo(bounds.x, bounds.y);
      });
      context.lineTo(face.bounds.face[0].x, face.bounds.face[0].y);
      context.stroke();
    });

    // Write the result to a file
    console.log('Writing to file ' + outputFile);
    var writeStream = fs.createWriteStream(outputFile);
    var pngStream = canvas.pngStream();

    pngStream.on('data', function (chunk) {
      writeStream.write(chunk);
    });
    pngStream.on('error', console.log);
    pngStream.on('end', callback);
  });
}

// Run the example
function main (inputFile, outputFile, Canvas, callback) {
  outputFile = outputFile || 'out.png';
  detectFaces(inputFile, function (err, faces) {
    if (err) {
      return callback(err);
    }

    console.log('Highlighting...');
    highlightFaces(inputFile, faces, outputFile, Canvas, function (err) {
      if (err) {
        return callback(err);
      }
      console.log('Finished!');
      callback(null, faces);
    });
  });
}

exports.main = main;

if (module === require.main) {
  if (process.argv.length < 3) {
    console.log('Usage: node faceDetection <inputFile> [outputFile]');
    process.exit(1);
  }
  var inputFile = process.argv[2];
  var outputFile = process.argv[3];
  exports.main(inputFile, outputFile, require('canvas'), console.log);
}
