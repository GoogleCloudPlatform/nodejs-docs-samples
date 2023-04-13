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

function main(projectId = 'YOUR_PROJECT_ID', location = 'global') {
  // [START translate_v3_get_supported_languages]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate');

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  async function getSupportedLanguages() {
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
    };

    // Get supported languages
    const [response] = await translationClient.getSupportedLanguages(request);

    for (const language of response.languages) {
      // Supported language code, generally consisting of its ISO 639-1 identifier, for
      // example, 'en', 'ja'. In certain cases, BCP-47 codes including language and
      // region identifiers are returned (for example, 'zh-TW' and 'zh-CN')
      console.log(`Language - Language Code: ${language.languageCode}`);
      // Human readable name of the language localized in the display language specified
      // in the request.
      console.log(`Language - Display Name: ${language.displayName}`);
      // Can be used as source language.
      console.log(`Language - Support Source: ${language.supportSource}`);
      // Can be used as target language.
      console.log(`Language - Support Target: ${language.supportTarget}`);
    }
  }

  getSupportedLanguages();
  // [END translate_v3_get_supported_languages]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
