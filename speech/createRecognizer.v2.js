// Copyright 2023 Google LLC
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
//   title: Create a speech recognizer
//   description: Create a speech recognizer in Speech-to-Text v2

async function main(recognizerId, projectId) {
  // [START speech_create_recognizer]

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const recognizerId = 'a unique name in your project for this recognizer';
  // const projectId = 'your Google Cloud project ID';

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v2;

  async function createRecognizer() {
    // Instantiate the client
    const client = new speech.SpeechClient();

    const recognizerRequest = {
      parent: `projects/${projectId}/locations/global`,
      recognizerId: recognizerId,
      recognizer: {
        languageCodes: ['en-US'],
        model: 'latest_long',
      },
    };

    const operation = await client.createRecognizer(recognizerRequest);
    const recognizer = operation[0].result;
    const recognizerName = recognizer.name;
    console.log(`Created new recognizer: ${recognizerName}`);
  }

  await createRecognizer();
  // [END speech_create_recognizer]
}

exports.createRecognizerV2 = main;
