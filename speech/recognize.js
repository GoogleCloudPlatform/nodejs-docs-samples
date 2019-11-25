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

async function syncRecognize(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_sync]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
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
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: `, transcription);
  // [END speech_transcribe_sync]
}

async function syncRecognizeGCS(
  gcsUri,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_sync_gcs]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const gcsUri = 'gs://my-bucket/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };
  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: `, transcription);
  // [END speech_transcribe_sync_gcs]
}

async function syncRecognizeWords(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_sync_recognize_words]
  // Imports the Google Cloud client library
  const fs = require('fs');
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
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
    console.log(`Transcription: `, result.alternatives[0].transcript);
    result.alternatives[0].words.forEach(wordInfo => {
      // NOTE: If you have a time offset exceeding 2^32 seconds, use the
      // wordInfo.{x}Time.seconds.high to calculate seconds.
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        `.` +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        `.` +
        wordInfo.endTime.nanos / 100000000;
      console.log(`Word: ${wordInfo.word}`);
      console.log(`\t ${startSecs} secs - ${endSecs} secs`);
    });
  });
  // [END speech_sync_recognize_words]
}

async function asyncRecognize(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_async]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };
  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);

  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  // [END speech_transcribe_async]
}

async function asyncRecognizeGCS(
  gcsUri,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_async_gcs]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const gcsUri = 'gs://my-bucket/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  // [END speech_transcribe_async_gcs]
}

async function asyncRecognizeGCSWords(
  gcsUri,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_async_word_time_offsets_gcs]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const gcsUri = 'gs://my-bucket/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);

  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  response.results.forEach(result => {
    console.log(`Transcription: ${result.alternatives[0].transcript}`);
    result.alternatives[0].words.forEach(wordInfo => {
      // NOTE: If you have a time offset exceeding 2^32 seconds, use the
      // wordInfo.{x}Time.seconds.high to calculate seconds.
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        `.` +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        `.` +
        wordInfo.endTime.nanos / 100000000;
      console.log(`Word: ${wordInfo.word}`);
      console.log(`\t ${startSecs} secs - ${endSecs} secs`);
    });
  });
  // [END speech_transcribe_async_word_time_offsets_gcs]
}

async function streamingRecognize(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_streaming]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Stream the audio to the Google Cloud Speech API
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      console.log(
        `Transcription: ${data.results[0].alternatives[0].transcript}`
      );
    });

  // Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
  fs.createReadStream(filename).pipe(recognizeStream);
  // [END speech_transcribe_streaming]
}

function streamingMicRecognize(encoding, sampleRateHertz, languageCode) {
  // [START speech_transcribe_streaming_mic]
  const recorder = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data =>
      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : `\n\nReached transcription time limit, press Ctrl+C\n`
      )
    );

  // Start recording and send the microphone input to the Speech API
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '10.0',
    })
    .stream()
    .on('error', console.error)
    .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
  // [END speech_transcribe_streaming_mic]
}

async function syncRecognizeModelSelection(
  filename,
  model,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_model_selection]
  // Imports the Google Cloud client library for Beta API
  /**
   * TODO(developer): Update client library import to use new
   * version of API when desired features become available
   */
  const speech = require('@google-cloud/speech').v1p1beta1;
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const model = 'Model to use, e.g. phone_call, video, default';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    model: model,
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
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: `, transcription);
  // [END speech_transcribe_model_selection]
}

async function syncRecognizeModelSelectionGCS(
  gcsUri,
  model,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_model_selection_gcs]
  // Imports the Google Cloud client library for Beta API
  /**
   * TODO(developer): Update client library import to use new
   * version of API when desired features become available
   */
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const gcsUri = 'gs://my-bucket/audio.raw';
  // const model = 'Model to use, e.g. phone_call, video, default';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    model: model,
  };
  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: `, transcription);
  // [END speech_transcribe_model_selection_gcs]
}

async function syncRecognizeWithAutoPunctuation(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_auto_punctuation]
  // Imports the Google Cloud client library for API
  /**
   * TODO(developer): Update client library import to use new
   * version of API when desired features become available
   */
  const speech = require('@google-cloud/speech');
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    languageCode: languageCode,
    enableAutomaticPunctuation: true,
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
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: `, transcription);
  // [END speech_transcribe_auto_punctuation]
}

async function syncRecognizeWithEnhancedModel(
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START speech_transcribe_enhanced_model]
  // Imports the Google Cloud client library for Beta API
  /**
   * TODO(developer): Update client library import to use new
   * version of API when desired features become available
   */
  const speech = require('@google-cloud/speech').v1p1beta1;
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    languageCode: languageCode,
    useEnhanced: true,
    model: 'phone_call',
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
  // [END speech_transcribe_enhanced_model]
}

async function syncRecognizeWithMultiChannel(fileName) {
  // [START speech_transcribe_multichannel]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const config = {
    encoding: `LINEAR16`,
    languageCode: `en-US`,
    audioChannelCount: 2,
    enableSeparateRecognitionPerChannel: true,
  };

  const audio = {
    content: fs.readFileSync(fileName).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(
      result =>
        ` Channel Tag: ${result.channelTag} ${result.alternatives[0].transcript}`
    )
    .join('\n');
  console.log(`Transcription: \n${transcription}`);
  // [END speech_transcribe_multichannel]
}

async function syncRecognizeWithMultiChannelGCS(gcsUri) {
  // [START speech_transcribe_multichannel_gcs]
  const speech = require('@google-cloud/speech').v1;

  // Creates a client
  const client = new speech.SpeechClient();

  const config = {
    encoding: 'LINEAR16',
    languageCode: `en-US`,
    audioChannelCount: 2,
    enableSeparateRecognitionPerChannel: true,
  };

  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(
      result =>
        ` Channel Tag: ${result.channelTag} ${result.alternatives[0].transcript}`
    )
    .join('\n');
  console.log(`Transcription: \n${transcription}`);
  // [END speech_transcribe_multichannel_gcs]
}

async function speechTranscribeDiarization(fileName) {
  // [START speech_transcribe_diarization]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  // Set config for Diarization
  const diarizationConfig = {
    enableSpeakerDiarization: true,
    maxSpeakerCount: 2,
  };

  const config = {
    encoding: `LINEAR16`,
    sampleRateHertz: 8000,
    languageCode: `en-US`,
    diarizationConfig: diarizationConfig,
    model: `phone_call`,
  };

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const audio = {
    content: fs.readFileSync(fileName).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  console.log(`Speaker Diarization:`);
  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;
  // Note: The transcript within each result is separate and sequential per result.
  // However, the words list within an alternative includes all the words
  // from all the results thus far. Thus, to get all the words with speaker
  // tags, you only have to take the words list from the last result:
  wordsInfo.forEach(a =>
    console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
  );
  // [END speech_transcribe_diarization]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `sync <filename>`,
    `Detects speech in a local audio file.`,
    {},
    opts =>
      syncRecognize(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-gcs <gcsUri>`,
    `Detects speech in an audio file located in a Google Cloud Storage bucket.`,
    {},
    opts =>
      syncRecognizeGCS(
        opts.gcsUri,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-words <filename>`,
    `Detects speech in a local audio file with word time offset.`,
    {},
    opts =>
      syncRecognizeWords(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `async <filename>`,
    `Creates a job to detect speech in a local audio file, and waits for the job to complete.`,
    {},
    opts =>
      asyncRecognize(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `async-gcs <gcsUri>`,
    `Creates a job to detect speech in an audio file located in a Google Cloud Storage bucket, and waits for the job to complete.`,
    {},
    opts =>
      asyncRecognizeGCS(
        opts.gcsUri,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `async-gcs-words <gcsUri>`,
    `Creates a job to detect speech  with word time offset in an audio file located in a Google Cloud Storage bucket, and waits for the job to complete.`,
    {},
    opts =>
      asyncRecognizeGCSWords(
        opts.gcsUri,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `stream <filename>`,
    `Detects speech in a local audio file by streaming it to the Speech API.`,
    {},
    opts =>
      streamingRecognize(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `listen`,
    `Detects speech in a microphone input stream. This command requires that you have SoX installed and available in your $PATH. See https://www.npmjs.com/package/node-record-lpcm16#dependencies`,
    {},
    opts =>
      streamingMicRecognize(
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-model <filename> <model>`,
    `Detects speech in a local audio file using provided model.`,
    {},
    opts =>
      syncRecognizeModelSelection(
        opts.filename,
        opts.model,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-model-gcs <gcsUri> <model>`,
    `Detects speech in an audio file located in a Google Cloud Storage bucket using provided model.`,
    {},
    opts =>
      syncRecognizeModelSelectionGCS(
        opts.gcsUri,
        opts.model,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-auto-punctuation <filename>`,
    `Detects speech in a local audio file with auto punctuation.`,
    {},
    opts =>
      syncRecognizeWithAutoPunctuation(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-enhanced-model <filename>`,
    `Detects speech in a local audio file using an enhanced model.`,
    {},
    opts =>
      syncRecognizeWithEnhancedModel(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-multi-channel <filename>`,
    `Differentiates input by audio channel in local audio file.`,
    {},
    opts =>
      syncRecognizeWithMultiChannel(
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `sync-multi-channel-gcs <gcsUri>`,
    `Differentiates input by audio channel in an audio file located in a Google Cloud Storage bucket.`,
    {},
    opts =>
      syncRecognizeWithMultiChannelGCS(
        opts.gcsUri,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    `Diarization`,
    `Isolate distinct speakers in an audio file`,
    {},
    opts => speechTranscribeDiarization(opts.speechFile)
  )
  .options({
    encoding: {
      alias: 'e',
      default: 'LINEAR16',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    sampleRateHertz: {
      alias: 'r',
      default: 16000,
      global: true,
      requiresArg: true,
      type: 'number',
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    speechFile: {
      alias: 'f',
      global: true,
      requiresArg: false,
      type: 'string',
    },
  })
  .example(`node $0 sync ./resources/audio.raw -e LINEAR16 -r 16000`)
  .example(`node $0 async-gcs gs://gcs-test-data/vr.flac -e FLAC -r 16000`)
  .example(`node $0 stream ./resources/audio.raw  -e LINEAR16 -r 16000`)
  .example(`node $0 listen`)
  .example(
    `node $0 sync-model ./resources/Google_Gnome.wav video -e LINEAR16 -r 16000`
  )
  .example(
    `node $0 sync-model-gcs gs://gcs-test-data/Google_Gnome.wav phone_call -e LINEAR16 -r 16000`
  )
  .example(`node $0 sync-auto-punctuation ./resources/commercial_mono.wav`)
  .example(`node $0 sync-enhanced-model ./resources/commercial_mono.wav`)
  .example(`node $0 sync-multi-channel ./resources/commercial_stereo.wav`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/speech/docs`)
  .help()
  .strict().argv;
