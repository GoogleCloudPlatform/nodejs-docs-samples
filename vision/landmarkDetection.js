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

// [START app]
// [START import_libraries]
var Vision = require('@google-cloud/vision');
// [END import_libraries]

// [START authenticate]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication

// Instantiate a vision client
var vision = Vision();
// [END authenticate]

/**
 * Uses the Vision API to detect landmarks in the given file.
 */
// [START construct_request]
function detectLandmarks (inputFile, callback) {
  var options = { verbose: true };

  // Make a call to the Vision API to detect the landmarks
  vision.detectLandmarks(inputFile, options, function (err, landmarks) {
    if (err) {
      return callback(err);
    }
    console.log('result:', JSON.stringify(landmarks, null, 2));
    callback(null, landmarks);
  });
}
// [END construct_request]

// Run the example
function main (inputFile, callback) {
  detectLandmarks(inputFile, function (err, landmarks) {
    if (err) {
      return callback(err);
    }

    // [START parse_response]
    console.log('Found landmark: ' + landmarks[0].desc + ' for ' + inputFile);
    // [END parse_response]
    callback(null, landmarks);
  });
}

// [START run_application]
if (module === require.main) {
  if (process.argv.length < 3) {
    console.log('Usage: node landmarkDetection <inputFile>');
    process.exit(1);
  }
  var inputFile = process.argv[2];
  main(inputFile, console.log);
}
// [END run_application]
// [END app]

exports.main = main;
