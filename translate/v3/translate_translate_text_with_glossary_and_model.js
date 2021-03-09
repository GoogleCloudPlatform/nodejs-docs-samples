// Copyright 2019 Google LLC
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

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  glossaryId = 'glossary',
  modelId = 'YOUR_MODEL_ID',
  text = 'text to translate'
) {
  // [START translate_v3_translate_text_with_glossary_and_model]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const glossaryId = 'YOUR_GLOSSARY_ID';
  // const modelId = 'YOUR_MODEL_ID';
  // const text = 'text to translate';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate');

  // Instantiates a client
  const translationClient = new TranslationServiceClient();
  async function translateTextWithGlossaryAndModel() {
    const glossaryConfig = {
      glossary: `projects/${projectId}/locations/${location}/glossaries/${glossaryId}`,
    };
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain', // mime types: text/plain, text/html
      sourceLanguageCode: 'en',
      targetLanguageCode: 'ja',
      glossaryConfig: glossaryConfig,
      model: `projects/${projectId}/locations/${location}/models/${modelId}`,
    };

    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.glossaryTranslations) {
      console.log(`Translation: ${translation.translatedText}`);
    }
  }

  translateTextWithGlossaryAndModel();
  // [END translate_v3_translate_text_with_glossary_and_model]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
