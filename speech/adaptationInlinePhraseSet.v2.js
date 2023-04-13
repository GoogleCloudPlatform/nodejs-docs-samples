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
//   title: Build inline phrase set
//   description: Build inline phrase set for adaptation in Speech-to-Text v2

async function main(recognizerName) {
  // [START speech_adaptation_v2_inline_phrase_set]
  /**
   * TODO(developer): Uncomment this variable before running the sample.
   */
  // const recognizerName = "projects/[PROJECT_ID]/locations/[LOCATION]/recognizers/[RECOGNIZER_ID]";

  // TODO(developer): Replace with your own file
  const audioFilePath = 'resources/brooklyn.flac';

  // Imports the Google Cloud Speech-to-Text library (v2)
  const speech = require('@google-cloud/speech').v2;
  const fs = require('fs');

  async function buildInlinePhraseSetV2() {
    // Instantiate the Speech client
    const client = new speech.SpeechClient();

    // Create an inline phrase set to produce a more accurate transcript.
    const phraseSet = {
      phrases: [{value: 'Brooklyn', boost: 10}],
    };
    const adaptation = {
      phraseSets: [{inlinePhraseSet: phraseSet}],
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

  await buildInlinePhraseSetV2();
  // [END speech_adaptation_v2_inline_phrase_set]
}

exports.buildInlinePhraseSetV2 = main;
