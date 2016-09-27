// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
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

const fs = require('fs');
const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech')();

// [START speech_sync_recognize]
function syncRecognize (filename, callback) {
  // Detect speech in the audio file, e.g. "./resources/audio.raw"
  speech.recognize(filename, {
    encoding: 'LINEAR16',
    sampleRate: 16000
  }, (err, results) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Results:', results);
    callback();
  });
}
// [END speech_sync_recognize]

// [START speech_async_recognize]
function asyncRecognize (filename, callback) {
  // Detect speech in the audio file, e.g. "./resources/audio.raw"
  speech.startRecognition(filename, {
    encoding: 'LINEAR16',
    sampleRate: 16000
  }, (err, operation) => {
    if (err) {
      callback(err);
      return;
    }

    operation
      .on('error', callback)
      .on('complete', (results) => {
        console.log('Results:', results);
        callback();
      });
  });
}
// [END speech_async_recognize]

// [START speech_streaming_recognize]
function streamingRecognize (filename, callback) {
  const options = {
    config: {
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
function streamingMicRecognize (filename) {
  const options = {
    config: {
      encoding: 'LINEAR16',
      sampleRate: 16000
    }
  };

  // Create a recognize stream
  const recognizeStream = speech.createRecognizeStream(options)
    .on('error', console.error)
    .on('data', (data) => process.stdout.write(data.results));

  // Start recording and send the microphone input to the Speech API
  record.start({ sampleRate: 16000 }).pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
}
// [END speech_streaming_mic_recognize]

// The command-line program
var cli = require('yargs');
var utils = require('../utils');

var program = module.exports = {
  syncRecognize: syncRecognize,
  asyncRecognize: asyncRecognize,
  streamingRecognize: streamingRecognize,
  streamingMicRecognize: streamingMicRecognize,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('sync <filename>', 'Detects speech in an audio file.', {}, function (options) {
    program.syncRecognize(options.filename, utils.makeHandler(false));
  })
  .command('async <filename>', 'Creates a job to detect speech in an audio file, and waits for the job to complete.', {}, function (options) {
    program.asyncRecognize(options.filename, utils.makeHandler(false));
  })
  .command('stream <filename>', 'Detects speech in an audio file by streaming it to the Speech API.', {}, function (options) {
    program.streamingRecognize(options.filename, utils.makeHandler(false));
  })
  .command('listen', 'Detects speech in a microphone input stream.', {}, function () {
    program.streamingMicRecognize();
  })
  .example('node $0 sync ./resources/audio.raw', 'Detects speech in "./resources/audio.raw".')
  .example('node $0 async ./resources/audio.raw', 'Creates a job to detect speech in "./resources/audio.raw", and waits for the job to complete.')
  .example('node $0 stream ./resources/audio.raw', 'Detects speech in "./resources/audio.raw" by streaming it to the Speech API.')
  .example('node $0 listen', 'Detects speech in a microphone input stream.')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/speech/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
