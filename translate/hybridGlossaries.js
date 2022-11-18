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

'use strict';

async function main(
  projectId = process.env.GCLOUD_PROJECT, // Your GCP Project Id
  inFile = 'resources/example.png',
  outFile = 'resources/example.mp3',
  glossaryLangs = ['fr', 'en'],
  glossaryName = 'bistro-glossary',
  glossaryUri = 'gs://cloud-samples-data/translation/bistro_glossary.csv'
) {
  // [START translate_hybrid_imports]
  // Imports the Google Cloud client library
  const textToSpeech = require('@google-cloud/text-to-speech');
  const translate = require('@google-cloud/translate').v3beta1;
  const vision = require('@google-cloud/vision');

  // Import other required libraries
  const fs = require('fs');
  //const escape = require('escape-html');
  const util = require('util');
  // [END translate_hybrid_imports]

  // [START translate_hybrid_vision]
  /**
   * Detects text in an image file
   *
   * ARGS
   * inputFile: path to image file
   * RETURNS
   * string of text detected in the input image
   **/
  async function picToText(inputFile) {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    // Performs text detection on the local file
    const [result] = await client.textDetection(inputFile);
    return result.fullTextAnnotation.text;
  }
  // [END translate_hybrid_vision]

  // [START translate_hybrid_create_glossary]
  /** Creates a GCP glossary resource
   * Assumes you've already manually uploaded a glossary to Cloud Storage
   *
   * ARGS
   * languages: list of languages in the glossary
   * projectId: GCP project id
   * glossaryName: name you want to give this glossary resource
   * glossaryUri: the uri of the glossary you uploaded to Cloud Storage
   * RETURNS
   * nothing
   **/
  async function createGlossary(
    languages,
    projectId,
    glossaryName,
    glossaryUri
  ) {
    // Instantiates a client
    const translationClient = await new translate.TranslationServiceClient();

    // Construct glossary
    const glossary = {
      languageCodesSet: {
        languageCodes: languages,
      },
      inputConfig: {
        gcsSource: {
          inputUri: glossaryUri,
        },
      },
      name: translationClient.glossaryPath(
        projectId,
        'us-central1',
        glossaryName
      ),
    };

    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, 'us-central1'),
      glossary: glossary,
    };

    // Create glossary using a long-running operation.
    try {
      const [operation] = await translationClient.createGlossary(request);
      // Wait for operation to complete.
      await operation.promise();
      console.log('Created glossary ' + glossaryName + '.');
    } catch (AlreadyExists) {
      console.log(
        'The glossary ' +
          glossaryName +
          ' already exists. No new glossary was created.'
      );
    }
  }
  // [END translate_hybrid_create_glossary]

  // [START translate_hybrid_translate]
  /**
   * Translates text to a given language using a glossary
   *
   * ARGS
   * text: String of text to translate
   * sourceLanguageCode: language of input text
   * targetLanguageCode: language of output text
   * projectId: GCP project id
   * glossaryName: name you gave your project's glossary
   *     resource when you created it
   * RETURNS
   * String of translated text
   **/
  async function translateText(
    text,
    sourceLanguageCode,
    targetLanguageCode,
    projectId,
    glossaryName
  ) {
    // Instantiates a client
    const translationClient = new translate.TranslationServiceClient();
    const glossary = translationClient.glossaryPath(
      projectId,
      'us-central1',
      glossaryName
    );
    const glossaryConfig = {
      glossary: glossary,
    };
    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, 'us-central1'),
      contents: [text],
      mimeType: 'text/plain', // mime types: text/plain, text/html
      sourceLanguageCode: sourceLanguageCode,
      targetLanguageCode: targetLanguageCode,
      glossaryConfig: glossaryConfig,
    };

    // Run request
    const [response] = await translationClient.translateText(request);
    // Extract the string of translated text
    return response.glossaryTranslations[0].translatedText;
  }
  // [END translate_hybrid_translate]

  // [START translate_hybrid_tts]
  /**
   * Generates synthetic audio from plaintext tagged with SSML.
   *
   * Given the name of a text file and an output file name, this function
   * tags the text in the text file with SSML. This function then
   * calls the Text-to-Speech API. The API returns a synthetic audio
   * version of the text, formatted according to the SSML commands. This
   * function saves the synthetic audio to the designated output file.
   *
   * ARGS
   * text: String of plaintext
   * outFile: String name of file under which to save audio output
   * RETURNS
   * nothing
   *
   */
  async function syntheticAudio(text, outFile) {
    // Replace special characters with HTML Ampersand Character Codes
    // These codes prevent the API from confusing text with SSML tags
    // For example, '<' --> '&lt;' and '&' --> '&amp;'
    let escapedLines = text.replace(/&/g, '&amp;');
    escapedLines = escapedLines.replace(/"/g, '&quot;');
    escapedLines = escapedLines.replace(/</g, '&lt;');
    escapedLines = escapedLines.replace(/>/g, '&gt;');

    // Convert plaintext to SSML
    // Tag SSML so that there is a 2 second pause between each address
    const expandedNewline = escapedLines.replace(/\n/g, '\n<break time="2s"/>');
    const ssmlText = '<speak>' + expandedNewline + '</speak>';

    // Creates a client
    const client = new textToSpeech.TextToSpeechClient();

    // Constructs the request
    const request = {
      // Select the text to synthesize
      input: {ssml: ssmlText},
      // Select the language and SSML Voice Gender (optional)
      voice: {languageCode: 'en-US', ssmlGender: 'MALE'},
      // Select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the Text-to-Speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outFile, response.audioContent, 'binary');
    console.log('Audio content written to file ' + outFile);
  }
  // [END translate_hybrid_tts]

  // [START translate_hybrid_integration]
  await createGlossary(glossaryLangs, projectId, glossaryName, glossaryUri);
  const text = await picToText(inFile);
  const translatedText = await translateText(
    text,
    'fr',
    'en',
    projectId,
    glossaryName
  );
  syntheticAudio(translatedText, outFile);
  // [END translate_hybrid_integration]
}

main(...process.argv.slice(2));
