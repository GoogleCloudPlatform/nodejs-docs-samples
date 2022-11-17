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
  location = 'us-central1',
  inputUri = 'gs://cloud-samples-data/translation/async_invoices/*',
  outputUri = 'gs://YOUR_PROJECT_ID/translation/BATCH_DOCUMENT_TRANSLATION_OUTPUT/'
) {
  // [START translate_batch_translate_document]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const inputUri = 'path_to_your_files';
  // const outputUri = 'path_to_your_output_bucket';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  const documentInputConfig = {
    gcsSource: {
      inputUri: inputUri,
    },
  };

  async function batchTranslateDocument() {
    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, location),
      documentInputConfig: documentInputConfig,
      sourceLanguageCode: 'en-US',
      targetLanguageCodes: ['sr-Latn'],
      inputConfigs: [
        {
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

    // Batch translate documents using a long-running operation.
    // You can wait for now, or get results later.
    const [operation] = await translationClient.batchTranslateDocument(request);

    // Wait for operation to complete.
    const [response] = await operation.promise();

    console.log(`Total Pages: ${response.totalPages}`);
  }

  batchTranslateDocument();
  // [END translate_batch_translate_document]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
