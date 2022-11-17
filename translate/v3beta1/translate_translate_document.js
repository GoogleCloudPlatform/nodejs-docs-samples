// Copyright 2021 Google LLC
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

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'global',
  inputUri = 'path_to_your_file'
) {
  // [START translate_translate_document]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';
  // const inputUri = 'path_to_your_file';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  const documentInputConfig = {
    gcsSource: {
      inputUri: inputUri,
    },
  };

  async function translateDocument() {
    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, location),
      documentInputConfig: documentInputConfig,
      sourceLanguageCode: 'en-US',
      targetLanguageCode: 'sr-Latn',
    };

    // Run request
    const [response] = await translationClient.translateDocument(request);

    console.log(
      `Response: Mime Type - ${response.documentTranslation.mimeType}`
    );
  }

  translateDocument();
  // [END translate_translate_document]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
