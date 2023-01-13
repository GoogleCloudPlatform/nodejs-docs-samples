// Copyright 2023 Google LLC
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

// sample-metadata:
//   title: Transcribe a local file using streaming recognition
//   description: Streaming transcription of a local file using Speech-to-Text v2

async function main(recognizerName) {
  //[START speech_transcribe_streaming_v2]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const recognizerName = 'Resource name, e.g. projects/[projectId]/locations/global/recognizers/[recognizerId]'

  const filename = 'resources/brooklyn.flac';
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v2;

  async function streamingRecognize() {
    // Creates a client
    const client = new speech.SpeechClient();

    const recognitionConfig = {
      // autoDecodingConfig removes the need to specify audio encoding.
      // This field only needs to be present in the recognitionConfig
      autoDecodingConfig: {},
    };
    const streamingConfig = {
      config: recognitionConfig,
    };

    const configRequest = {
      recognizer: recognizerName,
      streamingConfig: streamingConfig,
    };

    // Read a file as bytes, base64 encoded
    const readStream = fs.createReadStream(filename, {
      highWaterMark: 4096,
      encoding: 'base64',
    });

    const chunks = [];
    let writeStream;
    readStream
      .on('data', chunk => {
        const request = {
          audio: chunk.toString(),
        };
        chunks.push(request);
      })
      .on('close', () => {
        // Config-only request should be first in stream of requests
        writeStream.write(configRequest);
        for (const chunk of chunks) {
          writeStream.write(chunk);
        }
        writeStream.end();
      });

    await new Promise((resolve, reject) => {
      writeStream = client
        ._streamingRecognize()
        .on('data', response => {
          const {results} = response;
          const {transcript} = results[0].alternatives[0];
          return resolve(transcript);
        })
        .on('error', err => {
          console.error(err.message);
          return reject(err);
        });
    }).then(transcript => {
      console.log(transcript);
    });
  }
  await streamingRecognize();
  //[END speech_transcribe_streaming_v2]
}

exports.streamingRecognizeV2 = main;
