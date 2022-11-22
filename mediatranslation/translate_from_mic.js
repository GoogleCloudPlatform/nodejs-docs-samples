// Copyright 2020, Google LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

/**
 * This application demonstrates how to perform basic translation operations
 * with the Google Cloud Media Translation API.
 *
 * Note: Correct microphone settings is required: check enclosed link, and make
 * sure the following conditions are met:
 * 1. SoX must be installed and available in your $PATH- it can be found here:
 * http://sox.sourceforge.net/
 * 2. Microphone must be working
 * 3. Encoding, sampleRateHertz, and # of channels must match header of audio file you're
 * recording to.
 * 4. Get Node-Record-lpcm16 https://www.npmjs.com/package/node-record-lpcm16
 * More Info: https://cloud.google.com/speech-to-text/docs/streaming-recognize
 */

/**
 * Translates audio streaming from a microphone
 * @param {string} encoding the audio encoding codec
 * @param {string} sampleRateHertz the sampling rate of the audio stream
 * @param {string} sourceLanguageCode the language to translate from
 * @param {string} targetLanguageCode the language to translate to
 */
function main(encoding, sampleRateHertz, sourceLanguage, targetLanguage) {
  sampleRateHertz = Number(sampleRateHertz);

  // [START mediatranslation_translate_from_mic]

  // Allow user input from terminal
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function doTranslationLoop() {
    rl.question("Press any key to translate or 'q' to quit: ", answer => {
      if (answer.toLowerCase() === 'q') {
        rl.close();
      } else {
        translateFromMicrophone();
      }
    });
  }

  // Node-Record-lpcm16
  const recorder = require('node-record-lpcm16');

  // Imports the Cloud Media Translation client library
  const {
    SpeechTranslationServiceClient,
  } = require('@google-cloud/media-translation');

  // Creates a client
  const client = new SpeechTranslationServiceClient();

  function translateFromMicrophone() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    //const encoding = 'linear16';
    //const sampleRateHertz = 16000;
    //const sourceLanguage = 'Language to translate from, as BCP-47 locale';
    //const targetLanguage = 'Language to translate to, as BCP-47 locale';
    console.log('Begin speaking ...');

    const config = {
      audioConfig: {
        audioEncoding: encoding,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      },
      singleUtterance: true,
    };

    // First request needs to have only a streaming config, no data.
    const initialRequest = {
      streamingConfig: config,
      audioContent: null,
    };

    let currentTranslation = '';
    let currentRecognition = '';
    // Create a recognize stream
    const stream = client
      .streamingTranslateSpeech()
      .on('error', e => {
        if (e.code && e.code === 4) {
          console.log('Streaming translation reached its deadline.');
        } else {
          console.log(e);
        }
      })
      .on('data', response => {
        const {result, speechEventType} = response;
        if (speechEventType === 'END_OF_SINGLE_UTTERANCE') {
          console.log(`\nFinal translation: ${currentTranslation}`);
          console.log(`Final recognition result: ${currentRecognition}`);

          stream.destroy();
          recording.stop();
        } else {
          currentTranslation = result.textTranslationResult.translation;
          currentRecognition = result.recognitionResult;
          console.log(`\nPartial translation: ${currentTranslation}`);
          console.log(`Partial recognition result: ${currentRecognition}`);
        }
      });

    let isFirst = true;
    // Start recording and send microphone input to the Media Translation API
    const recording = recorder.record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0, //silence threshold
      recordProgram: 'rec',
      silence: '5.0', //seconds of silence before ending
    });
    recording
      .stream()
      .on('data', chunk => {
        if (isFirst) {
          stream.write(initialRequest);
          isFirst = false;
        }
        const request = {
          streamingConfig: config,
          audioContent: chunk.toString('base64'),
        };
        if (!stream.destroyed) {
          stream.write(request);
        }
      })
      .on('close', () => {
        doTranslationLoop();
      });
  }

  doTranslationLoop();
  // [END mediatranslation_translate_from_mic]
}
main(...process.argv.slice(2));
