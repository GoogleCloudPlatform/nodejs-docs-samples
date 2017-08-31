/**
 * Copyright 2017, Google, Inc.
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

function syncRecognize (filename, encoding, sampleRateHertz, languageCode) {
  // [START speech_sync_recognize]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
  // const filename = '/path/to/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64')
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file
  speech.recognize(request)
    .then((data) => {
      const response = data[0];
      const transcription = response.results.map(result =>
          result.alternatives[0].transcript).join('\n');
      console.log(`Transcription: `, transcription);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END speech_sync_recognize]
}

function syncRecognizeGCS (gcsUri, encoding, sampleRateHertz, languageCode) {
  // [START speech_sync_recognize_gcs]
  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The Google Cloud Storage URI of the file on which to perform speech recognition, e.g. gs://my-bucket/audio.raw
  // const gcsUri = 'gs://my-bucket/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  };
  const audio = {
    uri: gcsUri
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file
  speech.recognize(request)
    .then((data) => {
      const response = data[0];
      const transcription = response.results.map(result =>
          result.alternatives[0].transcript).join('\n');
      console.log(`Transcription: `, transcription);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END speech_sync_recognize_gcs]
}

function syncRecognizeWords (filename, encoding, sampleRateHertz, languageCode) {
  // [START speech_sync_recognize_words]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
  // const filename = '/path/to/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64')
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file
  speech.recognize(request)
    .then((data) => {
      const response = data[0];
      response.results.forEach((result) => {
        console.log(`Transcription: `, result.alternatives[0].transcript);
        result.alternatives[0].words.forEach((wordInfo) => {
          // NOTE: If you have a time offset exceeding 2^32 seconds, use the
          // wordInfo.{x}Time.seconds.high to calculate seconds.
          const startSecs = `${wordInfo.startTime.seconds}` + `.` +
              (wordInfo.startTime.nanos / 100000000);
          const endSecs = `${wordInfo.endTime.seconds}` + `.` +
              (wordInfo.endTime.nanos / 100000000);
          console.log(`Word: ${wordInfo.word}`);
          console.log(`\t ${startSecs} secs - ${endSecs} secs`);
        });
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END speech_sync_recognize_words]
}

function asyncRecognize (filename, encoding, sampleRateHertz, languageCode) {
  // [START speech_async_recognize]
  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');
  const fs = require('fs');

  // Instantiates a client
  const speech = Speech();

  // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
  // const filename = '/path/to/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64')
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  speech.longRunningRecognize(request)
    .then((data) => {
      const response = data[0];
      const operation = response;
      // Get a Promise representation of the final result of the job
      return operation.promise();
    })
    .then((data) => {
      const response = data[0];
      const transcription = response.results.map(result =>
          result.alternatives[0].transcript).join('\n');
      console.log(`Transcription: ${transcription}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END speech_async_recognize]
}

function asyncRecognizeGCS (gcsUri, encoding, sampleRateHertz, languageCode) {
  // [START speech_async_recognize_gcs]
  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The Google Cloud Storage URI of the file on which to perform speech recognition, e.g. gs://my-bucket/audio.raw
  // const gcsUri = 'gs://my-bucket/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  };

  const audio = {
    uri: gcsUri
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  speech.longRunningRecognize(request)
    .then((data) => {
      const operation = data[0];
      // Get a Promise representation of the final result of the job
      return operation.promise();
    })
    .then((data) => {
      const response = data[0];
      const transcription = response.results.map(result =>
          result.alternatives[0].transcript).join('\n');
      console.log(`Transcription: ${transcription}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END speech_async_recognize_gcs]
}

function asyncRecognizeGCSWords (gcsUri, encoding, sampleRateHertz, languageCode) {
  // [START speech_async_recognize_gcs_words]
  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The Google Cloud Storage URI of the file on which to perform speech recognition, e.g. gs://my-bucket/audio.raw
  // const gcsUri = 'gs://my-bucket/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  };

  const audio = {
    uri: gcsUri
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  speech.longRunningRecognize(request)
    .then((data) => {
      const operation = data[0];
      // Get a Promise representation of the final result of the job
      return operation.promise();
    })
    .then((data) => {
      const response = data[0];
      response.results.forEach((result) => {
        console.log(`Transcription: ${result.alternatives[0].transcript}`);
        result.alternatives[0].words.forEach((wordInfo) => {
          // NOTE: If you have a time offset exceeding 2^32 seconds, use the
          // wordInfo.{x}Time.seconds.high to calculate seconds.
          const startSecs = `${wordInfo.startTime.seconds}` + `.` +
              (wordInfo.startTime.nanos / 100000000);
          const endSecs = `${wordInfo.endTime.seconds}` + `.` +
              (wordInfo.endTime.nanos / 100000000);
          console.log(`Word: ${wordInfo.word}`);
          console.log(`\t ${startSecs} secs - ${endSecs} secs`);
        });
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END speech_async_recognize_gcs_words]
}

function streamingRecognize (filename, encoding, sampleRateHertz, languageCode) {
  // [START speech_streaming_recognize]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
  // const filename = '/path/to/audio.raw';

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode
    },
    interimResults: false // If you want interim results, set this to true
  };

  // Stream the audio to the Google Cloud Speech API
  const recognizeStream = speech.streamingRecognize(request)
    .on('error', console.error)
    .on('data', (data) => {
      console.log(
          `Transcription: ${data.results[0].alternatives[0].transcript}`);
    });

  // Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
  fs.createReadStream(filename).pipe(recognizeStream);
  // [END speech_streaming_recognize]
}

function streamingMicRecognize (encoding, sampleRateHertz, languageCode) {
  // [START speech_streaming_mic_recognize]
  const record = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  const Speech = require('@google-cloud/speech');

  // Instantiates a client
  const speech = Speech();

  // The encoding of the audio file, e.g. 'LINEAR16'
  // const encoding = 'LINEAR16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode
    },
    interimResults: false // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = speech.streamingRecognize(request)
    .on('error', console.error)
    .on('data', (data) =>
        process.stdout.write(
          (data.results[0] && data.results[0].alternatives[0])
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : `\n\nReached transcription time limit, press Ctrl+C\n`));

  // Start recording and send the microphone input to the Speech API
  record
    .start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '10.0'
    })
    .on('error', console.error)
    .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
  // [END speech_streaming_mic_recognize]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `sync <filename>`,
    `Detects speech in a local audio file.`,
    {},
    (opts) => syncRecognize(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `sync-gcs <gcsUri>`,
    `Detects speech in an audio file located in a Google Cloud Storage bucket.`,
    {},
    (opts) => syncRecognizeGCS(opts.gcsUri, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `sync-words <filename>`,
    `Detects speech in a local audio file with word time offset.`,
    {},
    (opts) => syncRecognizeWords(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `async <filename>`,
    `Creates a job to detect speech in a local audio file, and waits for the job to complete.`,
    {},
    (opts) => asyncRecognize(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `async-gcs <gcsUri>`,
    `Creates a job to detect speech in an audio file located in a Google Cloud Storage bucket, and waits for the job to complete.`,
    {},
    (opts) => asyncRecognizeGCS(opts.gcsUri, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `async-gcs-words <gcsUri>`,
    `Creates a job to detect speech  with word time offset in an audio file located in a Google Cloud Storage bucket, and waits for the job to complete.`,
    {},
    (opts) => asyncRecognizeGCSWords(opts.gcsUri, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `stream <filename>`,
    `Detects speech in a local audio file by streaming it to the Speech API.`,
    {},
    (opts) => streamingRecognize(opts.filename, opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .command(
    `listen`,
    `Detects speech in a microphone input stream. This command requires that you have SoX installed and available in your $PATH. See https://www.npmjs.com/package/node-record-lpcm16#dependencies`,
    {},
    (opts) => streamingMicRecognize(opts.encoding, opts.sampleRateHertz, opts.languageCode)
  )
  .options({
    encoding: {
      alias: 'e',
      default: 'LINEAR16',
      global: true,
      requiresArg: true,
      type: 'string'
    },
    sampleRateHertz: {
      alias: 'r',
      default: 16000,
      global: true,
      requiresArg: true,
      type: 'number'
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      global: true,
      requiresArg: true,
      type: 'string'
    }
  })
  .example(`node $0 sync ./resources/audio.raw -e LINEAR16 -r 16000`)
  .example(`node $0 async-gcs gs://gcs-test-data/vr.flac -e FLAC -r 16000`)
  .example(`node $0 stream ./resources/audio.raw  -e LINEAR16 -r 16000`)
  .example(`node $0 listen`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/speech/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
