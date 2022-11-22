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
  glossaryId = 'glossary-id'
) {
  // [START translate_v3_delete_glossary]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';
  // const glossaryId = 'YOUR_GLOSSARY_ID';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate');

  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  async function deleteGlossary() {
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      name: `projects/${projectId}/locations/${location}/glossaries/${glossaryId}`,
    };

    // Delete glossary using a long-running operation
    const [operation] = await translationClient.deleteGlossary(request);

    // Wait for operation to complete.
    const [response] = await operation.promise();

    console.log(`Deleted glossary: ${response.name}`);
  }

  deleteGlossary();
  // [END translate_v3_delete_glossary]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
