// Copyright 2017 Google LLC
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
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
async function synthesizeText(
  text,
  outputFile,
  effectsProfileId,
  languageCode,
  ssmlGender
) {
  //[START tts_synthesize_text_audio_profile_beta]

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/text-to-speech');
  const fs = require('fs');
  const util = require('util');

  // Creates a client
  const client = new speech.TextToSpeechClient();

  const request = {
    input: {text: text},
    voice: {languageCode: languageCode, ssmlGender: ssmlGender},
    audioConfig: {audioEncoding: 'MP3', effectsProfileId: effectsProfileId},
  };

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(outputFile, response.audioContent, 'binary');
  console.log(`Audio content written to file: ${outputFile}`);
  // [END tts_synthesize_text_audio_profile_beta]
}

async function main() {
  require('yargs')
    .demand(1)
    .command(
      'synthesize <text>',
      'Detects speech in a local audio file.',
      {},
      opts =>
        synthesizeText(
          opts.text,
          opts.outputFile,
          opts.effectsProfileId,
          opts.languageCode,
          opts.ssmlGender
        )
    )
    .options({
      text: {
        alias: 't',
        default: 'Hey Everybody!  This is a test!',
        global: true,
        requiresArg: true,
        type: 'string',
      },
      outputFile: {
        alias: 'f',
        default: './resources/test.mp3',
        global: true,
        requiresArg: false,
        type: 'string',
      },
      effectsProfileId: {
        alias: 'e',
        default: 'telephony-class-application',
        global: true,
        requiresArg: true,
        type: 'string',
      },
      languageCode: {
        alias: 'l',
        default: 'en-US',
        global: true,
        requiresArg: true,
        tnodeype: 'string',
      },
      ssmlGender: {
        alias: 'g',
        default: 'FEMALE',
        global: true,
        requiresArg: true,
        type: 'string',
      },
    })
    .array('effectsProfileId')
    .example('node $0 synthesize "Enter Phrase to Test Here"')
    .example(
      'node $0 synthesize "This is optimized for Phone" -f ./resources/phone.mp3 -e telephony-class-application -l en-US'
    )
    .example(
      'node $0 synthesize "This is optimized for a Wearable, like a watch" -f ./resources/watch.mp3 -e wearable-class-device -l en-US'
    )
    .example(
      'node $0 synthesize "This is optimized for Home Entertainment System" -f ./resources/homestereo.mp3 -e large-home-entertainment-class-device'
    )
    .example(
      'node $0 synthesize "This is optimized for the Car" -f ./resources/car.mp3 -e large-automotive-class-device'
    )
    .wrap(120)
    .recommendCommands()
    .epilogue('For more information, see https://cloud.google.com/speech/docs')
    .help()
    .strict().argv;
}

main().catch(console.error);
