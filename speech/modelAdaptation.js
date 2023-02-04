// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

'use strict';

function main(projectId, location, gcsUri, customClassId, phraseSetId) {
  // [START speech_transcribe_with_model_adaptation]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Create the speech client
  const client = new speech.SpeechClient();

  // Create the adaptation client
  const adaptationClient = new speech.AdaptationClient();

  async function modelAdaptation() {
    // Create`PhraseSet` and `CustomClasses` to create custom lists of similar
    // items that are likely to occur in your input data.

    // The parent resource where the custom class and phrase set will be created.
    const parent = `projects/${projectId}/locations/${location}`;

    // Create the custom class
    const customClassResponse = await adaptationClient.createCustomClass({
      parent: parent,
      customClassId: customClassId,
      customClass: {
        items: [{value: 'sushido'}, {value: 'altura'}, {value: 'taneda'}],
      },
    });

    // Create the phrase set
    const phraseSetResponse = await adaptationClient.createPhraseSet({
      parent: parent,
      phraseSetId: phraseSetId,
      phraseSet: {
        boost: 10,
        phrases: [{value: `Visit restaurants like ${customClassId}`}],
      },
    });

    // The next section shows how to use the newly created custom
    // class and phrase set to send a transcription request with speech adaptation

    const speechAdaptation = {
      phraseSets: [phraseSetResponse[0]],
      phraseSetReferences: [],
      customClasses: [customClassResponse[0]],
    };

    const audio = {
      uri: gcsUri,
    };

    const config = {
      encoding: 'FLAC',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      adaptation: speechAdaptation,
    };

    const request = {
      audio: audio,
      config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
  }
  modelAdaptation();
  // [END speech_transcribe_with_model_adaptation]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
