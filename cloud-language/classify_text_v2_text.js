// Copyright 2023 Google LLC
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

async function main(text) {
  async function classifyTextOfText() {
    // [START language_classify_text]
    // Imports the Google Cloud client library
    const language = require('@google-cloud/language').v2;

    // Creates a client
    const client = new language.LanguageServiceClient();

    /**
     * TODO(developer): Uncomment the following line to run this code.
     */
    // const text = 'Your text to analyze, e.g. Hello, world!';

    // Prepares a document, representing the provided text
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Classifies text in the document
    const [classification] = await client.classifyText({document});
    console.log('Categories:');
    classification.categories.forEach(category => {
      console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
    });
    // [END language_classify_text]
  }
  await classifyTextOfText();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
