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
  inputUri = 'gs://cloud-samples-data/translation/text.txt',
  outputUri = 'gs://YOUR_PROJECT_ID/translation/BATCH_TRANSLATION_OUTPUT/',
  glossaryId = 'YOUR_GLOSSARY_ID'
) {
  // [START translate_v3_batch_translate_text_with_glossary]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const inputUri = 'gs://cloud-samples-data/text.txt';
  // const outputUri = 'gs://YOUR_BUCKET_ID/path_to_store_results/';
  // const glossaryId = 'YOUR_GLOSSARY_ID';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate');

  // Instantiates a client
  const client = new TranslationServiceClient();
  async function batchTranslateTextWithGlossary() {
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      sourceLanguageCode: 'en',
      targetLanguageCodes: ['es'],
      inputConfigs: [
        {
          mimeType: 'text/plain', // mime types: text/plain, text/html
          gcsSource: {
            inputUri: inputUri,
          },
        },
      ],
      outputConfig: {
        gcsDestination: {
          outputUriPrefix: outputUri,
        },
      },
      glossaries: {
        es: {
          glossary: `projects/${projectId}/locations/${location}/glossaries/${glossaryId}`,
        },
      },
    };

    const options = {timeout: 240000};
    // Create a job using a long-running operation
    const [operation] = await client.batchTranslateText(request, options);

    // Wait for the operation to complete
    const [response] = await operation.promise();

    // Display the translation for each input text provided
    console.log(`Total Characters: ${response.totalCharacters}`);
    console.log(`Translated Characters: ${response.translatedCharacters}`);
  }

  batchTranslateTextWithGlossary();
  // [END translate_v3_batch_translate_text_with_glossary]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
