/**
 * Copyright 2016, Google, Inc.
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

/**
 * This application demonstrates how to perform basic recognize operations with
 * with the Google Cloud Speech API.
 *
 * For more information, see the README.md under /speech and the documentation
 * at https://cloud.google.com/speech/docs.
 */

'use strict';

const Speech = require('@google-cloud/speech');

// [START speech_sync_recognize]
function syncRecognize (filename) {
  // Instantiates a client
  const speech = Speech();

  const config = {
    // Configure these settings based on the audio you're transcribing
    encoding: 'LINEAR16',
    sampleRate: 16000
  };

  // Detects speech in the audio file, e.g. "./resources/audio.raw"
  return speech.recognize(filename, config)
    .then((results) => {
      const transcription = results[0];
      console.log(`Transcription: ${transcription}`);
      return transcription;
    });
}
// [END speech_sync_recognize]

// [START speech_async_recognize]
function asyncRecognize (filename) {
  // Instantiates a client
  const speech = Speech();

  const config = {
    // Configure these settings based on the audio you're transcribing
    encoding: 'LINEAR16',
    sampleRate: 16000
  };

  // Detects speech in the audio file, e.g. "./resources/audio.raw"
  // This creates a recognition job that you can wait for now, or get its result
  // later.
  return speech.startRecognition(filename, config)
    .then((results) => {
      const operation = results[0];
      // Get a Promise represention the final result of the job
      return operation.promise();
    })
    .then((transcription) => {
      console.log(`Transcription: ${transcription}`);
      return transcription;
    });
}
// [END speech_async_recognize]

// [START speech_streaming_recognize]
const fs = require('fs');

function streamingRecognize (filename, callback) {
  // Instantiates a client
  const speech = Speech();

  const options = {
    config: {
      // Configure these settings based on the audio you're transcribing
      encoding: 'LINEAR16',
      sampleRate: 16000
    }
  };

  // Create a recognize stream
  const recognizeStream = speech.createRecognizeStream(options)
    .on('error', callback)
    .on('data', (data) => {
      console.log('Data received: %j', data);
      callback();
    });

  // Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
  fs.createReadStream(filename).pipe(recognizeStream);
}
// [END speech_streaming_recognize]

// [START speech_streaming_mic_recognize]
const record = require('node-record-lpcm16');

function streamingMicRecognize () {
  // Instantiates a client
  const speech = Speech();

  const options = {
    config: {
      // Configure these settings based on the audio you're transcribing
      encoding: 'LINEAR16',
      sampleRate: 16000
    }
  };

  // Create a recognize stream
  const recognizeStream = speech.createRecognizeStream(options)
    .on('error', console.error)
    .on('data', (data) => process.stdout.write(data.results));

  // Start recording and send the microphone input to the Speech API
  record.start({
    sampleRate: 16000,
    threshold: 0
  }).pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
}
// [END speech_streaming_mic_recognize]

require(`yargs`)
  .demand(1)
  .command(
    `sync <filename>`,
    `Detects speech in an audio file.`,
    {},
    (opts) => syncRecognize(opts.filename)
  )
  .command(
    `async <filename>`,
    `Creates a job to detect speech in an audio file, and waits for the job to complete.`,
    {},
    (opts) => asyncRecognize(opts.filename)
  )
  .command(
    `stream <filename>`,
    `Detects speech in an audio file by streaming it to the Speech API.`,
    {},
    (opts) => streamingRecognize(opts.filename, () => {})
  )
  .command(
    `listen`,
    `Detects speech in a microphone input stream.`,
    {},
    streamingMicRecognize
  )
  .example(`node $0 sync ./resources/audio.raw`)
  .example(`node $0 async ./resources/audio.raw`)
  .example(`node $0 stream ./resources/audio.raw`)
  .example(`node $0 listen`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/speech/docs`)
  .help()
  .strict()
  .argv;
