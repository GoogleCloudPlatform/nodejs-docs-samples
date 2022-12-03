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

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  glossaryId = 'glossary-id'
) {
  // [START translate_create_glossary_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  async function createGlossary() {
    // Construct glossary
    const glossary = {
      languageCodesSet: {
        languageCodes: ['en', 'es'],
      },
      inputConfig: {
        gcsSource: {
          inputUri: 'gs://cloud-samples-data/translation/glossary.csv',
        },
      },
      name: translationClient.glossaryPath(projectId, location, glossaryId),
    };

    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, location),
      glossary: glossary,
    };

    // Create glossary using a long-running operation.
    // You can wait for now, or get results later.
    const [operation] = await translationClient.createGlossary(request);

    // Wait for operation to complete.
    await operation.promise();

    console.log('Created glossary:');
    console.log(`InputUri ${request.glossary.inputConfig.gcsSource.inputUri}`);
  }

  createGlossary();
  // [END translate_create_glossary_beta]
}

main(...process.argv.slice(2));
