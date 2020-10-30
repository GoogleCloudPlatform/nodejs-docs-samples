// Copyright 2018 Google LLC
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

'use strict';

// This sample uses the UUID library to generate the output filename.
const uuid = require('uuid');
const functions = require('firebase-functions');

const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
// The supportedLanguageCodes and outputBucket parameters take the value from
// environment variables by default.
const firebaseConfigured = typeof functions.config().playchat !== 'undefined';
const languageCodesParam = firebaseConfigured
  ? functions.config().playchat.supported_language_codes
  : process.env.SUPPORTED_LANGUAGE_CODES;
const supportedLanguageCodes = languageCodesParam.split(',');
const outputBucket = firebaseConfigured
  ? functions.config().playchat.output_bucket
  : process.env.OUTPUT_BUCKET;
const outputAudioEncoding = 'MP3';
const voiceSsmlGender = 'NEUTRAL';

// Declare the API clients as global variables to allow them to initiaze at cold start.
const {SpeechClient} = require('@google-cloud/speech');
const {Translate} = require('@google-cloud/translate').v2;
const {TextToSpeechClient} = require('@google-cloud/text-to-speech');
const {Storage} = require('@google-cloud/storage');

const speechToTextClient = new SpeechClient();
const textTranslationClient = new Translate({projectId: googleCloudProject});
const textToSpeechClient = new TextToSpeechClient();
const storageClient = new Storage({projectId: googleCloudProject});

exports.speechTranslate = functions.https.onRequest(
  async (request, response) => {
    const responseBody = {};

    try {
      await validateRequest(request);

      const inputEncoding = request.body.encoding;
      const inputSampleRateHertz = request.body.sampleRateHertz;
      const inputLanguageCode = request.body.languageCode;
      const inputAudioContent = request.body.audioContent;

      console.log(`Input encoding: ${inputEncoding}`);
      console.log(`Input sample rate hertz: ${inputSampleRateHertz}`);
      console.log(`Input language code: ${inputLanguageCode}`);

      // [START chain_cloud_calls]
      const [sttResponse] = await callSpeechToText(
        inputAudioContent,
        inputEncoding,
        inputSampleRateHertz,
        inputLanguageCode
      );

      // The data object contains one or more recognition
      // alternatives ordered by accuracy.
      const transcription = sttResponse.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      responseBody.transcription = transcription;
      responseBody.gcsBucket = outputBucket;

      const translations = [];
      supportedLanguageCodes.forEach(async languageCode => {
        const translation = {languageCode: languageCode};
        const outputFilename =
          request.body.outputFilename ||
          `${uuid.v4()}.${outputAudioEncoding.toLowerCase()}`;

        try {
          const [textTranslation] = await callTextTranslation(
            languageCode,
            transcription
          );
          translation.text = textTranslation;

          const [{audioContent}] = await callTextToSpeech(
            languageCode,
            textTranslation
          );
          const path = `${languageCode}/${outputFilename}`;

          console.log('zzx', audioContent);

          await uploadToCloudStorage(path, audioContent);

          console.log(`Successfully translated input to ${languageCode}.`);
          translation.gcsPath = path;
          translations.push(translation);
          if (translations.length === supportedLanguageCodes.length) {
            responseBody.translations = translations;
            console.log(`Response: ${JSON.stringify(responseBody)}`);
            response.status(200).send(responseBody);
          }
        } catch (error) {
          console.error(
            `Partial error in translation to ${languageCode}: ${error}`
          );
          translation.error = error.message;
          translations.push(translation);
          if (translations.length === supportedLanguageCodes.length) {
            responseBody.translations = translations;
            console.log(`Response: ${JSON.stringify(responseBody)}`);
            response.status(200).send(responseBody);
          }
        }
      });
      // [END chain_cloud_calls]
    } catch (error) {
      console.error(error);
      response.status(400).send(error.message);
    }
  }
);

// [START call_speech_to_text]
const callSpeechToText = (
  audioContent,
  encoding,
  sampleRateHertz,
  languageCode
) => {
  console.log(`Processing speech from audio content in ${languageCode}.`);

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    audio: {content: audioContent},
  };

  return speechToTextClient.recognize(request);
};
// [END call_speech_to_text]

// [START call_text_translation]
const callTextTranslation = (targetLangCode, data) => {
  console.log(`Translating text to ${targetLangCode}: ${data}`);

  return textTranslationClient.translate(data, targetLangCode);
};
// [END call_text_translation]

// [START call_text_to_speech]
const callTextToSpeech = (targetLocale, data) => {
  console.log(`Converting to speech in ${targetLocale}: ${data}`);

  const request = {
    input: {text: data},
    voice: {languageCode: targetLocale, ssmlGender: voiceSsmlGender},
    audioConfig: {audioEncoding: outputAudioEncoding},
  };

  return textToSpeechClient.synthesizeSpeech(request);
};
// [END call_text_to_speech]

// [START upload_to_cloud_storage]
const uploadToCloudStorage = (path, contents) => {
  console.log(`Uploading audio file to ${path}`);

  return storageClient.bucket(outputBucket).file(path).save(contents);
};
// [END upload_to_cloud_storage]

// [START validate_request]
const validateRequest = request => {
  return new Promise((resolve, reject) => {
    if (!request.body.encoding) {
      reject(new Error('Invalid encoding.'));
    }
    if (!request.body.sampleRateHertz || isNaN(request.body.sampleRateHertz)) {
      reject(new Error('Sample rate hertz must be numeric.'));
    }
    if (!request.body.languageCode) {
      reject(new Error('Invalid language code.'));
    }
    if (!request.body.audioContent) {
      reject(new Error('Invalid audio content.'));
    }

    resolve();
  });
};
// [END validate_request]
