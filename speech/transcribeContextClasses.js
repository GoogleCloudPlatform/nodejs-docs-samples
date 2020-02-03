// Copyright 2020 Google LLC
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

function main(storageUri) {
  // [START speech_transcribe_sync]
  // Provides "hints" to the speech recognizer to favor
  // specific classes of words in the results.

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  async function transcribeContextClasses() {
    // storageUri = 'gs://YOUR_BUCKET_ID/path/to/your/file.wav'
    const audio = {
      uri: storageUri,
    };

    // SpeechContext: to configure your speech_context see:
    // https://cloud.google.com/speech-to-text/docs/reference/rpc/google.cloud.speech.v1#speechcontext
    // Full list of supported phrases(class tokens) here:
    // https://cloud.google.com/speech-to-text/docs/class-tokens
    const speechContext = {
      phrases: ['$TIME'],
    };

    // RecognitionConfig: to configure your encoding and sample_rate_hertz, see:
    // https://cloud.google.com/speech-to-text/docs/reference/rpc/google.cloud.speech.v1#recognitionconfig
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 8000,
      languageCode: 'en-US',
      speechContexts: [speechContext],
    };

    const request = {
      config: config,
      audio: audio,
    };

    // Detects speech in the audio file.
    const [response] = await client.recognize(request);
    response.results.forEach((result, index) => {
      const transcript = result.alternatives[0].transcript;
      console.log('-'.repeat(20));
      console.log(`First alternative of result ${index}`);
      console.log(`Transcript: ${transcript}`);
    });
  }

  transcribeContextClasses().catch(console.error);
  // [END speech_transcribe_sync]
}

main(...process.argv.slice(2));
