// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// sample-metadata:
//   title: Cloud Vision Custom API Endpoint
//   description: Demonstrates using a custom API endpoint for the Cloud Vision API.
//   usage: node setEndpoint.js

function main() {
  // [START vision_set_endpoint]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  async function setEndpoint() {
    // Specifies the location of the api endpoint
    const clientOptions = {apiEndpoint: 'eu-vision.googleapis.com'};

    // Creates a client
    const client = new vision.ImageAnnotatorClient(clientOptions);

    // Performs text detection on the image file
    const [result] = await client.textDetection('./resources/wakeupcat.jpg');
    const labels = result.textAnnotations;
    console.log('Text:');
    labels.forEach(label => console.log(label.description));
  }
  setEndpoint();
  // [END vision_set_endpoint]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
