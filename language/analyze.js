/**
 * Copyright 2016, Google, Inc.
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

const Language = require('@google-cloud/language');
const Storage = require('@google-cloud/storage');

// [START language_sentiment_string]
function analyzeSentimentOfText (text) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = language.document({
    // The document text, e.g. "Hello, world!"
    content: text
  });

  // Detects the sentiment of the document
  return document.detectSentiment()
    .then((results) => {
      const sentiment = results[0];
      console.log(`Sentiment: ${sentiment >= 0 ? 'positive' : 'negative'}.`);
      return sentiment;
    });
}
// [END language_sentiment_string]

// [START language_sentiment_file]
function analyzeSentimentInFile (bucketName, fileName) {
  // Instantiates clients
  const language = Language();
  const storage = Storage();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The text file to analyze, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Instantiates a Document, representing a text file in Cloud Storage
  const document = language.document({
    // The GCS file
    content: file
  });

  // Detects the sentiment of the document
  return document.detectSentiment()
    .then((results) => {
      const sentiment = results[0];
      console.log(`Sentiment: ${sentiment >= 0 ? 'positive' : 'negative'}.`);
      return sentiment;
    });
}
// [END language_sentiment_file]

// [START language_entities_string]
function analyzeEntitiesOfText (text) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = language.document({
    // The document text, e.g. "Hello, world!"
    content: text
  });

  // Detects entities in the document
  return document.detectEntities()
    .then((results) => {
      const entities = results[0];
      console.log('Entities:');
      for (let type in entities) {
        console.log(`${type}:`, entities[type]);
      }
      return entities;
    });
}
// [END language_entities_string]

// [START language_entities_file]
function analyzeEntitiesInFile (bucketName, fileName) {
  // Instantiates clients
  const language = Language();
  const storage = Storage();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The text file to analyze, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Instantiates a Document, representing a text file in Cloud Storage
  const document = language.document({
    // The GCS file
    content: file
  });

  // Detects entities in the document
  return document.detectEntities()
    .then((results) => {
      const entities = results[0];
      console.log('Entities:');
      for (let type in entities) {
        console.log(`${type}:`, entities[type]);
      }
      return entities;
    });
}
// [END language_entities_file]

// [START language_syntax_string]
function analyzeSyntaxOfText (text) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = language.document({
    // The document text, e.g. "Hello, world!"
    content: text
  });

  // Detects syntax in the document
  return document.detectSyntax()
    .then((results) => {
      const syntax = results[0];
      console.log('Tags:');
      syntax.forEach((part) => console.log(part.tag));
      return syntax;
    });
}
// [END language_syntax_string]

// [START language_syntax_file]
function analyzeSyntaxInFile (bucketName, fileName) {
  // Instantiates clients
  const language = Language();
  const storage = Storage();

  // The bucket where the file resides, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // The text file to analyze, e.g. "file.txt"
  const file = bucket.file(fileName);

  // Instantiates a Document, representing a text file in Cloud Storage
  const document = language.document({
    // The GCS file
    content: file
  });

  // Detects syntax in the document
  return document.detectSyntax()
    .then((results) => {
      const syntax = results[0];
      console.log('Tags:');
      syntax.forEach((part) => console.log(part.tag));
      return syntax;
    });
}
// [END language_syntax_file]

// The command-line program
const cli = require(`yargs`);

const program = module.exports = {
  analyzeSentimentOfText,
  analyzeSentimentInFile,
  analyzeEntitiesOfText,
  analyzeEntitiesInFile,
  analyzeSyntaxOfText,
  analyzeSyntaxInFile,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`sentimentOfText <text>`, `Detect the sentiment of a block of text.`, {}, (opts) => {
    program.analyzeSentimentOfText(opts.text);
  })
  .command(`sentimentInFile <bucket> <filename>`, `Detect the sentiment of text in a GCS file.`, {}, (opts) => {
    program.analyzeSentimentInFile(opts.bucket, opts.filename);
  })
  .command(`entitiesOfText <text>`, `Detect the entities of a block of text.`, {}, (opts) => {
    program.analyzeEntitiesOfText(opts.text);
  })
  .command(`entitiesInFile <bucket> <filename>`, `Detect the entities of text in a GCS file.`, {}, (opts) => {
    program.analyzeEntitiesInFile(opts.bucket, opts.filename);
  })
  .command(`syntaxOfText <text>`, `Detect the syntax of a block of text.`, {}, (opts) => {
    program.analyzeSyntaxOfText(opts.text);
  })
  .command(`syntaxInFile <bucket> <filename>`, `Detect the syntax of text in a GCS file.`, {}, (opts) => {
    program.analyzeSyntaxInFile(opts.bucket, opts.filename);
  })
  .example(`node $0 sentimentOfText "President Obama is speaking at the White House."`, ``)
  .example(`node $0 sentimentInFile my-bucket file.txt`, ``)
  .example(`node $0 entitiesOfText "President Obama is speaking at the White House."`, ``)
  .example(`node $0 entitiesInFile my-bucket file.txt`, ``)
  .example(`node $0 syntaxOfText "President Obama is speaking at the White House."`, ``)
  .example(`node $0 syntaxInFile my-bucket file.txt`, ``)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/natural-language/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
