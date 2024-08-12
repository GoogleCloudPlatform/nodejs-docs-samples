// Copyright 2018 Google LLC
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

async function main() {
  // [START tts_quickstart]
  // Imports the Google Cloud client library
  const textToSpeech = require('@google-cloud/text-to-speech');

  // Import other required libraries
  const {writeFile} = require('node:fs/promises');

  // Creates a client
  const client = new textToSpeech.TextToSpeechClient();

  async function quickStart() {
    // The text to synthesize
    const text = 'hello, world!';

    // Construct the request
    const request = {
      input: {text: text},
      // Select the language and SSML voice gender (optional)
      voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
      // select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Save the generated binary audio content to a local file
    await writeFile('output.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
  }

  await quickStart();
  // [END tts_quickstart]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
