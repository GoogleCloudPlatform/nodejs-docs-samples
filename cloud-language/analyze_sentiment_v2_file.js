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

async function main(bucketName, fileName) {
  async function analyzeSentimentInFile() {
    // [START language_sentiment_gcs]
    // Imports the Google Cloud client library
    const language = require('@google-cloud/language').v2;

    // Creates a client
    const client = new language.LanguageServiceClient();

    /**
     * TODO(developer): Uncomment the following lines to run this code
     */
    // const bucketName = 'Your bucket name, e.g. my-bucket';
    // const fileName = 'Your file name, e.g. my-file.txt';

    // Prepares a document, representing a text file in Cloud Storage
    const document = {
      gcsContentUri: `gs://${bucketName}/${fileName}`,
      type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the document
    const [result] = await client.analyzeSentiment({document});

    const sentiment = result.documentSentiment;
    console.log('Document sentiment:');
    console.log(`  Score: ${sentiment.score}`);
    console.log(`  Magnitude: ${sentiment.magnitude}`);

    const sentences = result.sentences;
    sentences.forEach(sentence => {
      console.log(`Sentence: ${sentence.text.content}`);
      console.log(`  Score: ${sentence.sentiment.score}`);
      console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
    });
    // [END language_sentiment_gcs]
  }
  await analyzeSentimentInFile();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
