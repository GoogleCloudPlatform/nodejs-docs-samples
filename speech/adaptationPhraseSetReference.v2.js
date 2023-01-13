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
//   title: Create persistent PhraseSet
//   description: Create persistent PhraseSet for adaptation in Speech-to-Text v2

async function main(projectId, phraseSetId, recognizerName) {
  // [START speech_adaptation_v2_phrase_set_reference]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = "your Google Cloud project id";
  // const phraseSetId = "a unique ID in your project for this phrase set";
  // const recognizerName = "projects/[PROJECT_ID]/locations/[LOCATION]/recognizers/[RECOGNIZER_ID]";

  // TODO(developer): Replace with your own file
  const audioFilePath = 'resources/brooklyn.flac';

  // Imports the Google Cloud Speech-to-Text library (v2)
  const speech = require('@google-cloud/speech').v2;
  const fs = require('fs');

  async function createPersistentPhraseSetV2() {
    // Instantiate the Speech-to-Text client
    const client = new speech.SpeechClient();

    // Create a persistent PhraseSet to reference in a recognition request
    const parent = `projects/${projectId}/locations/global`;
    const phraseSetRequest = {
      parent,
      phraseSetId,
      phraseSet: {
        phrases: [{value: 'Brooklyn', boost: 10}],
      },
    };

    const phraseSetOp = await client.createPhraseSet(phraseSetRequest);
    const phraseSet = phraseSetOp[0].result;
    console.log(`PhraseSet name: ${phraseSet.name}`);

    // Add a reference to the Phrase set into the recognition request
    const adaptation = {
      phraseSets: [{phraseSet: phraseSet.name}],
    };

    const config = {
      autoDecodingConfig: {},
      adaptation,
    };

    // Transcribe audio using speech adaptation
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

  await createPersistentPhraseSetV2();
  // [END speech_adaptation_v2_phrase_set_reference]
}

exports.createPersistentPhraseSetV2 = main;
