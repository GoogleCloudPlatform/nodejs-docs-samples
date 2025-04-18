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
  location = 'global',
  text = 'text to translate'
) {
  // [START translate_v3_translate_text]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';
  // const text = 'text to translate';

  // Imports the Google Cloud Translation library
  // [START translate_v3_import_client_library]
  const {TranslationServiceClient} = require('@google-cloud/translate');
  // [END translate_v3_import_client_library]

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  async function translateText() {
    // MIME type of the content to translate
    // Supported MIME types:
    // https://cloud.google.com/translate/docs/supported-formats
    const mimeType = 'text/plain';

    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: mimeType,
      sourceLanguageCode: 'en',
      targetLanguageCode: 'sr-Latn',
    };

    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translation: ${translation.translatedText}`);
    }
  }

  translateText();
  // [END translate_v3_translate_text]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
