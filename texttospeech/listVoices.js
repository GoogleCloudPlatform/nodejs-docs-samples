/**
 * Copyright 2018, Google, Inc.
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

'use strict';

function listVoices() {
  // [START tts_list_voices]
  const textToSpeech = require('@google-cloud/text-to-speech');

  const client = new textToSpeech.TextToSpeechClient();

  client
    .listVoices({})
    .then(results => {
      const voices = results[0].voices;

      console.log('Voices:');
      voices.forEach(voice => {
        console.log(`Name: ${voice.name}`);
        console.log(`  SSML Voice Gender: ${voice.ssmlGender}`);
        console.log(
          `  Natural Sample Rate Hertz: ${voice.naturalSampleRateHertz}`
        );
        console.log(`  Supported languages:`);
        voice.languageCodes.forEach(languageCode => {
          console.log(`    ${languageCode}`);
        });
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END tts_list_voices]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(`list-voices`, `List supported voices.`, {}, () => listVoices())
  .example(`node $0 list-voices`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/text-to-speech/docs`
  )
  .help()
  .strict().argv;
