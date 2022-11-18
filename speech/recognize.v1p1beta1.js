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

/**
 * This application demonstrates how to perform basic recognize operations with
 * with the Google Cloud Speech API.
 *
 * For more information, see the README.md under /speech and the documentation
 * at https://cloud.google.com/speech/docs.
 */

'use strict';

// sample-metadata:
//   title: Recognize speech with metadata
//   description: Analyzes an audio stream, and detects speech along with metadata.
//   usage: node recognize.v1p1beta1.js ./resources/commercial_mono.wav <encoding> <sampleRateHertz> <languageCode>

function main(
  filename,
  encoding = 'LINEAR16',
  sampleRateHertz = 16000,
  languageCode = 'en-US'
) {
  // [START speech_transcribe_recognition_metadata_beta]
  // Imports the Google Cloud client library for Beta API
  /**
   * TODO(developer): Update client library import to use new
   * version of API when desired features become available
   */
  const speech = require('@google-cloud/speech').v1p1beta1;
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  async function syncRecognizeWithMetaData() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
    // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
    // const sampleRateHertz = 16000;
    // const languageCode = 'BCP-47 language code, e.g. en-US';

    const recognitionMetadata = {
      interactionType: 'DISCUSSION',
      microphoneDistance: 'NEARFIELD',
      recordingDeviceType: 'SMARTPHONE',
      recordingDeviceName: 'Pixel 2 XL',
      industryNaicsCodeOfAudio: 519190,
    };

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      metadata: recognitionMetadata,
    };

    const audio = {
      content: fs.readFileSync(filename).toString('base64'),
    };

    const request = {
      config: config,
      audio: audio,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    response.results.forEach(result => {
      const alternative = result.alternatives[0];
      console.log(alternative.transcript);
    });
    // [END speech_transcribe_recognition_metadata_beta]
  }
  syncRecognizeWithMetaData();
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
