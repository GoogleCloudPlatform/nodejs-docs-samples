// Copyright 2022 Google LLC
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
//   title: Speech-to-Text v2 Quickstart
//   description: Transcribe a local file using Speech-to-Text v2

async function main(
  projectId,
  recognizerId = 'my-recognizer',
  audioFilePath = 'resources/brooklyn.flac'
) {
  // [START speech_quickstart_v2]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = "your-project-id";
  // const recognizerId = "your-recognizer-id";
  // const audioFilePath = "path/to/audio/file";

  // Imports the Google Cloud Speech-to-Text library (v2)
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  async function quickstartV2() {
    // Instantiates a client
    const client = new speech.v2.SpeechClient();

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

    const content = fs.readFileSync(audioFilePath).toString('base64');

    const transcriptionRequest = {
      recognizer: recognizer.name,
      config: {
        // Automatically detects audio encoding
        autoDecodingConfig: {},
      },
      content: content,
    };

    const response = await client.recognize(transcriptionRequest);
    for (const result of response[0].results) {
      console.log(`Transcript: ${result.alternatives[0].transcript}`);
    }
  }

  await quickstartV2();
  // [END speech_quickstart_v2]
}

exports.quickstartV2 = main;
