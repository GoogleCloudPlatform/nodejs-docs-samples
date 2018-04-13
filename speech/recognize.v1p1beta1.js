/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic recognize operations with
 * with the Google Cloud Speech API.
 *
 * For more information, see the README.md under /speech and the documentation
 * at https://cloud.google.com/speech/docs.
 */

'use strict';

function syncRecognizeModelSelection(
  filename,
  model,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_model_selection]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const model = 'Model to use, e.g. phone_call, video, default';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    model: model,
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file
  client
    .recognize(request)
    .then(data => {
      const response = data[0];
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Transcription: `, transcription);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END speech_transcribe_model_selection]
}

function syncRecognizeModelSelectionGCS(
  gcsUri,
  model,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_model_selection_gcs]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const gcsUri = 'gs://my-bucket/audio.raw';
  // const model = 'Model to use, e.g. phone_call, video, default';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    model: model,
  };
  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file
  client
    .recognize(request)
    .then(data => {
      const response = data[0];
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Transcription: `, transcription);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END speech_transcribe_model_selection_gcs]
}

function syncRecognizeWithAutoPunctuation(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_file_with_auto_punctuation]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    languageCode: languageCode,
    enableAutomaticPunctuation: true,
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file
  client
    .recognize(request)
    .then(data => {
      const response = data[0];
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Transcription: `, transcription);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END speech_transcribe_file_with_auto_punctuation]
}

require(`yargs`)
  .demand(1)
  .command(
    `sync-model <filename> <model>`,
    `Detects speech in a local audio file using provided model.`,
    {},
    opts =>
      syncRecognizeModelSelection(
        opts.filename,
        opts.model,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-model-gcs <gcsUri> <model>`,
    `Detects speech in an audio file located in a Google Cloud Storage bucket using provided model.`,
    {},
    opts =>
      syncRecognizeModelSelectionGCS(
        opts.gcsUri,
        opts.model,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-auto-punctuation <filename>`,
    `Detects speech in a local audio file with auto punctuation.`,
    {},
    opts =>
      syncRecognizeWithAutoPunctuation(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .options({
    encoding: {
      alias: 'e',
      default: 'LINEAR16',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    sampleRateHertz: {
      alias: 'r',
      default: 16000,
      global: true,
      requiresArg: true,
      type: 'number',
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example(
    `node $0 sync-model ./resources/Google_Gnome.wav video -e LINEAR16 -r 16000`
  )
  .example(
    `node $0 sync-model-gcs gs://gcs-test-data/Google_Gnome.wav phone_call -e FLAC -r 16000`
  )
  .example(`node $0 sync-auto-punctuation ./resources/commercial_mono.wav`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/speech/docs`)
  .help()
  .strict().argv;
