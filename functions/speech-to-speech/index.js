/**
 * Copyright 2018, Google, LLC
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

'use strict';

// This sample uses the UUID library to generate the output filename.
const uuid = require('uuid/v4');

const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
const supportedLanguageCodes = process.env.SUPPORTED_LANGUAGE_CODES.split(',');
const outputBucket = process.env.OUTPUT_BUCKET;
const outputAudioEncoding = 'MP3';
const voiceSsmlGender = 'NEUTRAL';
// Declare the API clients as global variables to allow them to initiaze at cold start.
const speechToTextClient = getSpeechToTextClient();
const textTranslationClient = getTextTranslationClient();
const textToSpeechClient = getTextToSpeechClient();
const storageClient = getStorageClient();

exports.speechTranslate = (request, response) => {
  let responseBody = {};

  validateRequest(request).then(() => {
    const inputEncoding = request.body.encoding;
    const inputSampleRateHertz = request.body.sampleRateHertz;
    const inputLanguageCode = request.body.languageCode;
    const inputAudioContent = request.body.audioContent;

    console.log(`Input encoding: ${inputEncoding}`);
    console.log(`Input sample rate hertz: ${inputSampleRateHertz}`);
    console.log(`Input language code: ${inputLanguageCode}`);

    return callSpeechToText(
      inputAudioContent,
      inputEncoding,
      inputSampleRateHertz,
      inputLanguageCode
    );
  }).then(data => {
    const sttResponse = data[0];
    // The data object contains one or more recognition alternatives ordered by accuracy.
    const transcription = sttResponse.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    responseBody.transcription = transcription;
    responseBody.gcsBucket = outputBucket;

    let translations = [];
    supportedLanguageCodes.forEach(languageCode => {
      let translation = { languageCode: languageCode };
      const filenameUUID = uuid();
      const filename = filenameUUID + '.' + outputAudioEncoding.toLowerCase();
      callTextTranslation(languageCode, transcription).then(data => {
        const textTranslation = data[0];
        translation.text = textTranslation;
        return callTextToSpeech(languageCode, textTranslation);
      }).then(data => {
        const path = languageCode + '/' + filename;
        return uploadToCloudStorage(path, data[0].audioContent);
      }).then(() => {
        console.log(`Successfully translated input to ${languageCode}.`);
        translation.gcsPath = languageCode + '/' + filename;
        translations.push(translation);
        if (translations.length === supportedLanguageCodes.length) {
          responseBody.translations = translations;
          console.log(`Response: ${JSON.stringify(responseBody)}`);
          response.status(200).send(responseBody);
        }
      }).catch(error => {
        console.error(`Partial error in translation to ${languageCode}: ${error}`);
        translation.error = error.message;
        translations.push(translation);
        if (translations.length === supportedLanguageCodes.length) {
          responseBody.translations = translations;
          console.log(`Response: ${JSON.stringify(responseBody)}`);
          response.status(200).send(responseBody);
        }
      });
    });
  }).catch(error => {
    console.error(error);
    response.status(400).send(error.message);
  });
};

function callSpeechToText (audioContent, encoding, sampleRateHertz, languageCode) {
  console.log(`Processing speech from audio content in ${languageCode}.`);

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode
    },
    audio: { content: audioContent }
  };

  return speechToTextClient.recognize(request);
}

function callTextTranslation (targetLangCode, data) {
  console.log(`Translating text to ${targetLangCode}: ${data}`);

  return textTranslationClient.translate(data, targetLangCode);
}

function callTextToSpeech (targetLocale, data) {
  console.log(`Converting to speech in ${targetLocale}: ${data}`);

  const request = {
    input: { text: data },
    voice: { languageCode: targetLocale, ssmlGender: voiceSsmlGender },
    audioConfig: { audioEncoding: outputAudioEncoding }
  };

  return textToSpeechClient.synthesizeSpeech(request);
}

function uploadToCloudStorage (path, contents) {
  console.log(`Uploading audio file to ${path}`);

  return storageClient
    .bucket(outputBucket)
    .file(path)
    .save(contents);
}

function validateRequest (request) {
  return new Promise(function (resolve, reject) {
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
}

function getSpeechToTextClient () {
  const speech = require('@google-cloud/speech');
  return new speech.SpeechClient();
}

function getTextTranslationClient () {
  const { Translate } = require('@google-cloud/translate');
  return new Translate({ projectId: googleCloudProject });
}

function getTextToSpeechClient () {
  const textToSpeech = require('@google-cloud/text-to-speech');
  return new textToSpeech.TextToSpeechClient();
}

function getStorageClient () {
  const { Storage } = require('@google-cloud/storage');
  return new Storage({ projectId: googleCloudProject });
}
