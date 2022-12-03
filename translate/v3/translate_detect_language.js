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
  // [START translate_v3_detect_language]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';
  // const text = 'text to translate';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate');

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  async function detectLanguage() {
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      content: text,
    };

    // Run request
    const [response] = await translationClient.detectLanguage(request);

    console.log('Detected Languages:');
    for (const language of response.languages) {
      console.log(`Language Code: ${language.languageCode}`);
      console.log(`Confidence: ${language.confidence}`);
    }
  }

  detectLanguage();
  // [END translate_v3_detect_language]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
