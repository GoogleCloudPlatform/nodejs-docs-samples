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

async function setEndpoint() {
  // [START vision_set_endpoint]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Specifies the location of the api endpoint
  const clientOptions = {apiEndpoint: 'eu-vision.googleapis.com'};

  // Creates a client
  const client = new vision.ImageAnnotatorClient(clientOptions);
  // [END vision_set_endpoint]

  // Performs text detection on the image file
  const [result] = await client.textDetection('./resources/wakeupcat.jpg');
  const labels = result.textAnnotations;
  console.log('Text:');
  labels.forEach(label => console.log(label.description));
}

setEndpoint().catch(console.error);
