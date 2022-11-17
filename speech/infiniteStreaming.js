// Copyright 2019 Google LLC
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
 * This application demonstrates how to perform infinite streaming using the
 * streamingRecognize operation with the Google Cloud Speech API.
 * Before the streaming time limit is met, the program uses the
 * 'result end time' parameter to calculate the last 'isFinal' transcription.
 * When the time limit is met, the unfinalized audio from the previous session
 * is resent all at once to the API, before continuing the real-time stream
 * and resetting the clock, so the process can repeat.
 * Incoming audio should not be dropped / lost during reset, and context from
 * previous sessions should be maintained as long the utterance returns an
 * isFinal response before 2 * streamingLimit has expired.
 * The output text is color-coded:
 *    red - unfinalized transcript
 *    green - finalized transcript
 *    yellow/orange - API request restarted
 */

'use strict';

// sample-metadata:
//   title: Infinite Streaming
//   description: Performs infinite streaming using the streamingRecognize operation with the Cloud Speech API.
//   usage: node infiniteStreaming.js <encoding> <sampleRateHertz> <languageCode> <streamingLimit>

/**
 * Note: Correct microphone settings required: check enclosed link, and make
 * sure the following conditions are met:
 * 1. SoX must be installed and available in your $PATH- it can be found here:
 * http://sox.sourceforge.net/
 * 2. Microphone must be working
 * 3. Encoding, sampleRateHertz, and # of channels must match header of
 * audioInput file you're recording to.
 * 4. Get Node-Record-lpcm16 https://www.npmjs.com/package/node-record-lpcm16
 * More Info: https://cloud.google.com/speech-to-text/docs/streaming-recognize
 * 5. Set streamingLimit in ms. 290000 ms = ~5 minutes.
 * Maximum streaming limit should be 1/2 of SpeechAPI Streaming Limit.
 */

function main(
  encoding = 'LINEAR16',
  sampleRateHertz = 16000,
  languageCode = 'en-US',
  streamingLimit = 290000
) {
  // [START speech_transcribe_infinite_streaming]

  // const encoding = 'LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'en-US';
  // const streamingLimit = 10000; // ms - set to low number for demo purposes

  const chalk = require('chalk');
  const {Writable} = require('stream');
  const recorder = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  // Currently, only v1p1beta1 contains result-end-time
  const speech = require('@google-cloud/speech').v1p1beta1;

  const client = new speech.SpeechClient();

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const request = {
    config,
    interimResults: true,
  };

  let recognizeStream = null;
  let restartCounter = 0;
  let audioInput = [];
  let lastAudioInput = [];
  let resultEndTime = 0;
  let isFinalEndTime = 0;
  let finalRequestEndTime = 0;
  let newStream = true;
  let bridgingOffset = 0;
  let lastTranscriptWasFinal = false;

  function startStream() {
    // Clear current audioInput
    audioInput = [];
    // Initiate (Reinitiate) a recognize stream
    recognizeStream = client
      .streamingRecognize(request)
      .on('error', err => {
        if (err.code === 11) {
          // restartStream();
        } else {
          console.error('API request error ' + err);
        }
      })
      .on('data', speechCallback);

    // Restart stream when streamingLimit expires
    setTimeout(restartStream, streamingLimit);
  }

  const speechCallback = stream => {
    // Convert API result end time from seconds + nanoseconds to milliseconds
    resultEndTime =
      stream.results[0].resultEndTime.seconds * 1000 +
      Math.round(stream.results[0].resultEndTime.nanos / 1000000);

    // Calculate correct time based on offset from audio sent twice
    const correctedTime =
      resultEndTime - bridgingOffset + streamingLimit * restartCounter;

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let stdoutText = '';
    if (stream.results[0] && stream.results[0].alternatives[0]) {
      stdoutText =
        correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
    }

    if (stream.results[0].isFinal) {
      process.stdout.write(chalk.green(`${stdoutText}\n`));

      isFinalEndTime = resultEndTime;
      lastTranscriptWasFinal = true;
    } else {
      // Make sure transcript does not exceed console character length
      if (stdoutText.length > process.stdout.columns) {
        stdoutText =
          stdoutText.substring(0, process.stdout.columns - 4) + '...';
      }
      process.stdout.write(chalk.red(`${stdoutText}`));

      lastTranscriptWasFinal = false;
    }
  };

  const audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
      if (newStream && lastAudioInput.length !== 0) {
        // Approximate math to calculate time of chunks
        const chunkTime = streamingLimit / lastAudioInput.length;
        if (chunkTime !== 0) {
          if (bridgingOffset < 0) {
            bridgingOffset = 0;
          }
          if (bridgingOffset > finalRequestEndTime) {
            bridgingOffset = finalRequestEndTime;
          }
          const chunksFromMS = Math.floor(
            (finalRequestEndTime - bridgingOffset) / chunkTime
          );
          bridgingOffset = Math.floor(
            (lastAudioInput.length - chunksFromMS) * chunkTime
          );

          for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
            recognizeStream.write(lastAudioInput[i]);
          }
        }
        newStream = false;
      }

      audioInput.push(chunk);

      if (recognizeStream) {
        recognizeStream.write(chunk);
      }

      next();
    },

    final() {
      if (recognizeStream) {
        recognizeStream.end();
      }
    },
  });

  function restartStream() {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.removeListener('data', speechCallback);
      recognizeStream = null;
    }
    if (resultEndTime > 0) {
      finalRequestEndTime = isFinalEndTime;
    }
    resultEndTime = 0;

    lastAudioInput = [];
    lastAudioInput = audioInput;

    restartCounter++;

    if (!lastTranscriptWasFinal) {
      process.stdout.write('\n');
    }
    process.stdout.write(
      chalk.yellow(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`)
    );

    newStream = true;

    startStream();
  }
  // Start recording and send the microphone input to the Speech API
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0, // Silence threshold
      silence: 1000,
      keepSilence: true,
      recordProgram: 'rec', // Try also "arecord" or "sox"
    })
    .stream()
    .on('error', err => {
      console.error('Audio recording error ' + err);
    })
    .pipe(audioInputStreamTransform);

  console.log('');
  console.log('Listening, press Ctrl+C to stop.');
  console.log('');
  console.log('End (ms)       Transcript Results/Status');
  console.log('=========================================================');

  startStream();
  // [END speech_transcribe_infinite_streaming]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
