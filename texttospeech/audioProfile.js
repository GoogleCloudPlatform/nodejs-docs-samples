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
async function main(
  text = 'Hello Everybody!  This is an audio profile optimized sound byte.',
  outputFile = './resources/phone.mp3',
  languageCode = 'en-US',
  ssmlGender = 'FEMALE'
) {
  //[START tts_synthesize_text_audio_profile]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const text = 'Text you want to vocalize';
  // const outputFile = 'YOUR_OUTPUT_FILE_LOCAtION;
  // const languageCode = 'LANGUAGE_CODE_FOR_OUTPUT';
  // const ssmlGender = 'SSML_GENDER_OF_SPEAKER';

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/text-to-speech');
  const fs = require('fs');
  const util = require('util');

  // Creates a client
  const client = new speech.TextToSpeechClient();

  async function synthesizeWithEffectsProfile() {
    // Add one or more effects profiles to array.
    // Refer to documentation for more details:
    // https://cloud.google.com/text-to-speech/docs/audio-profiles
    const effectsProfileId = ['telephony-class-application'];

    const request = {
      input: {text: text},
      voice: {languageCode: languageCode, ssmlGender: ssmlGender},
      audioConfig: {audioEncoding: 'MP3', effectsProfileId: effectsProfileId},
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputFile}`);
  }
  // [END tts_synthesize_text_audio_profile]

  synthesizeWithEffectsProfile();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
