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

async function speechTranscribeDiarization(fileName) {
  // [START speech_transcribe_diarization_beta]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 8000,
    languageCode: 'en-US',
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 2,
    model: 'phone_call',
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
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  console.log('Speaker Diarization:');
  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;
  // Note: The transcript within each result is separate and sequential per result.
  // However, the words list within an alternative includes all the words
  // from all the results thus far. Thus, to get all the words with speaker
  // tags, you only have to take the words list from the last result:
  wordsInfo.forEach(a =>
    console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
  );
  // [END speech_transcribe_diarization_beta]
}

async function asyncSpeechTranscribeDiarizationGCS(gcsUri) {
  // [START speech_transcribe_diarization_gcs_beta]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const uri = path to GCS audio file e.g. `gs:/bucket/audio.wav`;

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 8000,
    languageCode: 'en-US',
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 2,
    model: 'phone_call',
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
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  console.log('Speaker Diarization:');
  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;
  // Note: The transcript within each result is separate and sequential per result.
  // However, the words list within an alternative includes all the words
  // from all the results thus far. Thus, to get all the words with speaker
  // tags, you only have to take the words list from the last result:
  wordsInfo.forEach(a =>
    console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
  );
  // [END speech_transcribe_diarization_gcs_beta]
}

async function speechTranscribeMultiChannel(fileName) {
  // [START speech_transcribe_multichannel_beta]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const config = {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
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
  // [END speech_transcribe_multichannel_beta]
}

async function speechTranscribeMultichannelGCS(gcsUri) {
  // [START speech_transcribe_multichannel_gcs_beta]
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  const config = {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
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
  // [END speech_transcribe_multichannel_gcs_beta]
}

async function speechTranscribeMultilang(fileName) {
  // [START speech_transcribe_multilanguage_beta]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 44100,
    languageCode: 'en-US',
    alternativeLanguageCodes: ['es-ES', 'en-US'],
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
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  // [END speech_transcribe_multilanguage_beta]
}

async function speechTranscribeMultilangGCS(gcsUri) {
  // [START speech_transcribe_multilanguage_gcs_beta]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const uri = path to GCS audio file e.g. `gs:/bucket/audio.wav`;

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 44100,
    languageCode: 'en-US',
    alternativeLanguageCodes: ['es-ES', 'en-US'],
  };

  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  // [END speech_transcribe_multilanguage_gcs_beta]
}

async function speechTranscribeWordLevelConfidence(fileName) {
  // [START speech_transcribe_word_level_confidence_beta]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const config = {
    encoding: 'FLAC',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordConfidence: true,
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
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  const confidence = response.results
    .map(result => result.alternatives[0].confidence)
    .join('\n');
  console.log(`Transcription: ${transcription} \n Confidence: ${confidence}`);

  console.log('Word-Level-Confidence:');
  const words = response.results.map(result => result.alternatives[0]);
  words[0].words.forEach(a => {
    console.log(` word: ${a.word}, confidence: ${a.confidence}`);
  });
  // [END speech_transcribe_word_level_confidence_beta]
}

async function speechTranscribeWordLevelConfidenceGCS(gcsUri) {
  // [START speech_transcribe_word_level_confidence_gcs_beta]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const uri = path to GCS audio file e.g. `gs:/bucket/audio.wav`;

  const config = {
    encoding: 'FLAC',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordConfidence: true,
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
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  const confidence = response.results
    .map(result => result.alternatives[0].confidence)
    .join('\n');
  console.log(`Transcription: ${transcription} \n Confidence: ${confidence}`);

  console.log('Word-Level-Confidence:');
  const words = response.results.map(result => result.alternatives[0]);
  words[0].words.forEach(a => {
    console.log(` word: ${a.word}, confidence: ${a.confidence}`);
  });
  // [END speech_transcribe_word_level_confidence_gcs_beta]
}

require('yargs')
  .demand(1)
  .command(
    'Diarization',
    'Isolate distinct speakers in an audio file',
    {},
    opts => speechTranscribeDiarization(opts.speechFile)
  )
  .command(
    'DiarizationGCS',
    'Isolate distinct speakers in an audio file located in a Google Cloud Storage bucket.',
    {},
    opts => asyncSpeechTranscribeDiarizationGCS(opts.gcsUri)
  )
  .command(
    'multiChannelTranscribe',
    'Differentiates input by audio channel in local audio file.',
    {},
    opts => speechTranscribeMultiChannel(opts.speechFile)
  )
  .command(
    'multiChannelTranscribeGCS',
    'Differentiates input by audio channel in an audio file located in a Google Cloud Storage bucket.',
    {},
    opts => speechTranscribeMultichannelGCS(opts.gcsUri)
  )
  .command(
    'multiLanguageTranscribe',
    'Transcribes multiple languages from local audio file.',
    {},
    opts => speechTranscribeMultilang(opts.speechFile)
  )
  .command(
    'multiLanguageTranscribeGCS',
    'Transcribes multiple languages from GCS audio file.',
    {},
    opts => speechTranscribeMultilangGCS(opts.gcsUri)
  )
  .command(
    'wordLevelConfidence',
    'Detects word level confidence from local audio file.',
    {},
    opts => speechTranscribeWordLevelConfidence(opts.speechFile)
  )
  .command(
    'wordLevelConfidenceGCS',
    'Detects word level confidence from GCS audio file.',
    {},
    opts => speechTranscribeWordLevelConfidenceGCS(opts.gcsUri)
  )
  .options({
    speechFile: {
      alias: 'f',
      global: true,
      requiresArg: false,
      type: 'string',
    },
    gcsUri: {
      alias: 'u',
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example('node $0 Diarization -f ./resources/commercial_mono.wav')
  .example(
    'node $0 DiarizationGCS -u gs://cloud-samples-tests/speech/commercial_mono.wav'
  )
  .example(
    'node $0 multiChannelTranscribe -f ./resources/commercial_stereo.wav'
  )
  .example(
    'node $0 multiChannelTranscribeGCS -u gs://cloud-samples-tests/speech/commercial_stereo.wav'
  )
  .example('node $0 multiLanguageTranscribe -f ./resources/multi.wav')
  .example(
    'node $0 multiLanguageTranscribeGCS -u gs://nodejs-docs-samples/multi_mono.wav'
  )
  .example('node $0 wordLevelConfidence -f ./resources/brooklyn.flac')
  .example(
    'node $0 wordLevelConfidenceGCS -u gs://cloud-samples-tests/speech/brooklyn.flac'
  )
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/speech/docs')
  .help()
  .strict().argv;
