// Copyright 2021 Google LLC
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

function main(
  inputUri,
  outputStorageUri,
  encoding,
  sampleRateHertz,
  languageCode,
  bucketName,
  objectName
) {
  // [START speech_export_to_gcs]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const inputUri = 'YOUR_AUDIO_TO_TRANSCRIBE';
  // const outputStorageUri = 'YOUR_STORAGE_BUCKET_OUTPUT_URI';
  // const encoding = 'ENCODING_OF_AUDIO_FILE';
  // const sampleRateHertz = 16000 // Sampling rate;
  // const languageCode = 'BCP-47_LANGUAGE_CODE_OF_AUDIO';

  // Imports the Speech-to-Text client library
  const speech = require('@google-cloud/speech');
  const {Storage} = require('@google-cloud/storage');
  const fsp = require('fs.promises');

  // Creates a client
  const speechClient = new speech.SpeechClient();

  // Creates a storage client
  const storageClient = new Storage();

  async function exportTranscriptToStorage() {
    const destFileName = 'file.json';
    const audio = {
      uri: inputUri,
    };

    // Pass in the URI of the Cloud Storage bucket to hold the transcription
    const outputConfig = {
      gcsUri: outputStorageUri,
    };

    const config = {
      encoding,
      sampleRateHertz,
      languageCode,
    };

    const request = {
      config,
      audio,
      outputConfig,
    };

    //  This creates a recognition job that you can wait for now, or get its result later.
    const [operation] = await speechClient.longRunningRecognize(request);

    // Get a Promise representation of the final result of the job
    await operation.promise();

    // Destination file
    const options = {
      destination: destFileName,
    };

    // Get bucket with name
    await storageClient.bucket(bucketName).file(objectName).download(options);

    // Get content as json
    const content = JSON.parse((await fsp.readFile(destFileName)).toString());

    // Print results
    const transcription = content.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log('Transcription: ', transcription);
  }
  exportTranscriptToStorage();
  // [END speech_export_to_gcs]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
