// Copyright 2024 Google LLC
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

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

import fs from 'fs/promises';

async function main() {
  // Create a Text-to-Speech client instance
  const client = new TextToSpeechClient();

  // The text that should be converted to speech
  const text = 'hello, world!';

  // Configure the text-to-speech request
  const request = {
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    // Configure the audio format of the output
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Save the generated binary audio content to a local file
    await fs.writeFile('quickstart_output.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
