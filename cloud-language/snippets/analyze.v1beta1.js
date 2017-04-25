/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function analyzeSentimentOfText (text) {
  // [START language_sentiment_string]
  // Imports the Google Cloud client library
  const Language = require('@google-cloud/language');

  // Instantiates a client
  const language = Language();

  // The text to analyze, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // Instantiates a Document, representing the provided text
  const document = language.document({ content: text });

  // Detects the sentiment of the document
  document.detectSentiment()
    .then((results) => {
      const sentiment = results[1].documentSentiment;
      console.log(`Document sentiment:`);
      console.log(`  Score: ${sentiment.score}`);
      console.log(`  Magnitude: ${sentiment.magnitude}`);

      const sentences = results[1].sentences;
      sentences.forEach((sentence) => {
        console.log(`Sentence: ${sentence.text.content}`);
        console.log(`  Score: ${sentence.sentiment.score}`);
        console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END language_sentiment_string]
}

function analyzeSentimentInFile (bucketName, fileName) {
  // [START language_sentiment_file]
  // Imports the Google Cloud client libraries
  const Language = require('@google-cloud/language');
  const Storage = require('@google-cloud/storage');

  // Instantiates the clients
  const language = Language();
  const storage = Storage();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The name of the file to analyze, e.g. "file.txt"
  // const fileName = 'file.txt';

  // Instantiates a Document, representing a text file in Cloud Storage
  const document = language.document({
    // The Google Cloud Storage file
    content: storage.bucket(bucketName).file(fileName)
  });

  // Detects the sentiment of the document
  document.detectSentiment()
    .then((results) => {
      const sentiment = results[1].documentSentiment;
      console.log(`Document sentiment:`);
      console.log(`  Score: ${sentiment.score}`);
      console.log(`  Magnitude: ${sentiment.magnitude}`);

      const sentences = results[1].sentences;
      sentences.forEach((sentence) => {
        console.log(`Sentence: ${sentence.text.content}`);
        console.log(`  Score: ${sentence.sentiment.score}`);
        console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END language_sentiment_file]
}

function analyzeEntitiesOfText (text) {
  // [START language_entities_string]
  // Imports the Google Cloud client library
  const Language = require('@google-cloud/language');

  // Instantiates a client
  const language = Language();

  // The text to analyze, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // Instantiates a Document, representing the provided text
  const document = language.document({ content: text });

  // Detects entities in the document
  document.detectEntities()
    .then((results) => {
      const entities = results[1].entities;

      console.log('Entities:');
      entities.forEach((entity) => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END language_entities_string]
}

function analyzeEntitiesInFile (bucketName, fileName) {
  // [START language_entities_file]
  // Imports the Google Cloud client libraries
  const Language = require('@google-cloud/language');
  const Storage = require('@google-cloud/storage');

  // Instantiates the clients
  const language = Language();
  const storage = Storage();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The name of the file to analyze, e.g. "file.txt"
  // const fileName = 'file.txt';

  // Instantiates a Document, representing a text file in Cloud Storage
  const document = language.document({
    // The Google Cloud Storage file
    content: storage.bucket(bucketName).file(fileName)
  });

  // Detects entities in the document
  document.detectEntities()
    .then((results) => {
      const entities = results[0];

      console.log('Entities:');
      entities.forEach((entity) => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END language_entities_file]
}

function analyzeSyntaxOfText (text) {
  // [START language_syntax_string]
  // Imports the Google Cloud client library
  const Language = require('@google-cloud/language');

  // Instantiates a client
  const language = Language();

  // The text to analyze, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // Instantiates a Document, representing the provided text
  const document = language.document({ content: text });

  // Detects syntax in the document
  document.detectSyntax()
    .then((results) => {
      const syntax = results[0];

      console.log('Parts of speech:');
      syntax.forEach((part) => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        console.log(`Morphology:`, part.partOfSpeech);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END language_syntax_string]
}

function analyzeSyntaxInFile (bucketName, fileName) {
  // [START language_syntax_file]
  // Imports the Google Cloud client libraries
  const Language = require('@google-cloud/language');
  const Storage = require('@google-cloud/storage');

  // Instantiates the clients
  const language = Language();
  const storage = Storage();

  // The name of the bucket where the file resides, e.g. "my-bucket"
  // const bucketName = 'my-bucket';

  // The name of the file to analyze, e.g. "file.txt"
  // const fileName = 'file.txt';

  // Instantiates a Document, representing a text file in Cloud Storage
  const document = language.document({
    // The Google Cloud Storage file
    content: storage.bucket(bucketName).file(fileName)
  });

  // Detects syntax in the document
  document.detectSyntax()
    .then((results) => {
      const syntax = results[0];

      console.log('Parts of speech:');
      syntax.forEach((part) => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        console.log(`Morphology:`, part.partOfSpeech);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END language_syntax_file]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `sentiment-text <text>`,
    `Detects sentiment of a string.`,
    {},
    (opts) => analyzeSentimentOfText(opts.text)
  )
  .command(
    `sentiment-file <bucketName> <fileName>`,
    `Detects sentiment in a file in Google Cloud Storage.`,
    {},
    (opts) => analyzeSentimentInFile(opts.bucketName, opts.fileName)
  )
  .command(
    `entities-text <text>`,
    `Detects entities in a string.`,
    {},
    (opts) => analyzeEntitiesOfText(opts.text)
  )
  .command(
    `entities-file <bucketName> <fileName>`,
    `Detects entities in a file in Google Cloud Storage.`,
    {},
    (opts) => analyzeEntitiesInFile(opts.bucketName, opts.fileName)
  )
  .command(
    `syntax-text <text>`,
    `Detects syntax of a string.`,
    {},
    (opts) => analyzeSyntaxOfText(opts.text)
  )
  .command(
    `syntax-file <bucketName> <fileName>`,
    `Detects syntax in a file in Google Cloud Storage.`,
    {},
    (opts) => analyzeSyntaxInFile(opts.bucketName, opts.fileName)
  )
  .example(`node $0 sentiment-text "President Obama is speaking at the White House."`)
  .example(`node $0 sentiment-file my-bucket file.txt`, `Detects sentiment in gs://my-bucket/file.txt`)
  .example(`node $0 entities-text "President Obama is speaking at the White House."`)
  .example(`node $0 entities-file my-bucket file.txt`, `Detects entities in gs://my-bucket/file.txt`)
  .example(`node $0 syntax-text "President Obama is speaking at the White House."`)
  .example(`node $0 syntax-file my-bucket file.txt`, `Detects syntax in gs://my-bucket/file.txt`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/natural-language/docs`)
  .help()
  .strict()
  .argv;
