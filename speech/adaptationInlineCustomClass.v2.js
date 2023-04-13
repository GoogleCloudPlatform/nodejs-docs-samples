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
//   title: Build inline custom class
//   description: Build inline custom class for adaptation in Speech-to-Text v2

async function main(recognizerName) {
  // [START speech_adaptation_v2_inline_custom_class]
  /**
   * TODO(developer): Uncomment this variable before running the sample.
   */
  // const recognizerName = "projects/[PROJECT_ID]/locations/[LOCATION]/recognizers/[RECOGNIZER_ID]";

  // TODO(developer): Replace with your own file
  const audioFilePath = 'resources/brooklyn.flac';

  // Imports the Google Cloud Speech-to-Text library (v2)
  const speech = require('@google-cloud/speech').v2;
  const fs = require('fs');

  async function buildInlineCustomClass() {
    const client = new speech.SpeechClient();

    // Create an inline phrase set to produce a more accurate transcript.
    const phraseSet = {
      phrases: [{value: '${brooklyn}', boost: 20}],
    };
    const customClass = {
      name: 'brooklyn',
      items: [{value: 'Brooklyn'}],
    };
    const adaptation = {
      phraseSets: [{inlinePhraseSet: phraseSet}],
      customClasses: [customClass],
    };

    const config = {
      autoDecodingConfig: {},
      adaptation,
    };

    const content = fs.readFileSync(audioFilePath).toString('base64');

    const transcriptionRequest = {
      recognizer: recognizerName,
      config,
      content,
    };
    const response = await client.recognize(transcriptionRequest);
    for (const result of response[0].results) {
      console.log(`Transcript: ${result.alternatives[0].transcript}`);
    }
  }

  await buildInlineCustomClass();
  // [END speech_adaptation_v2_inline_custom_class]
}

exports.buildInlineCustomClassV2 = main;
