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
  outputUri = 'gs://YOUR_PROJECT_ID/translation/BATCH_TRANSLATION_OUTPUT/'
) {
  // [START translate_v3_batch_translate_text]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const inputUri = 'gs://cloud-samples-data/text.txt';
  // const outputUri = 'gs://YOUR_BUCKET_ID/path_to_store_results/';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate');

  // Instantiates a client
  const translationClient = new TranslationServiceClient();
  async function batchTranslateText() {
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      sourceLanguageCode: 'en',
      targetLanguageCodes: ['ja'],
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
    };

    try {
      // Batch translate text using a long-running operation
      const [operation] = await translationClient.batchTranslateText(request);

      // Wait for operation to complete.
      const [response] = await operation.promise();

      console.log(`Total Characters: ${response.totalCharacters}`);
      console.log(`Translated Characters: ${response.translatedCharacters}`);
    } catch (error) {
      console.error(error.details);
    }
  }

  batchTranslateText();
  // [END translate_v3_batch_translate_text]
}

main(...process.argv.slice(2));
