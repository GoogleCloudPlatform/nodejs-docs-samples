// Copyright 2017 Google LLC
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

// sample-metadata:
//  title: Analyze v1beta2
async function analyzeSentimentOfText(text) {
  // [START language_sentiment_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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

  // Detects the sentiment of the document
  const [result] = await client.analyzeSentiment({document});
  const sentiment = result.documentSentiment;
  console.log(`Document sentiment:`);
  console.log(`  Score: ${sentiment.score}`);
  console.log(`  Magnitude: ${sentiment.magnitude}`);

  const sentences = result.sentences;
  sentences.forEach(sentence => {
    console.log(`Sentence: ${sentence.text.content}`);
    console.log(`  Score: ${sentence.sentiment.score}`);
    console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
  });
  // [END language_sentiment_string]
}

async function analyzeSentimentInFile(bucketName, fileName) {
  // [START language_sentiment_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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
  console.log(`Document sentiment:`);
  console.log(`  Score: ${sentiment.score}`);
  console.log(`  Magnitude: ${sentiment.magnitude}`);

  const sentences = result.sentences;
  sentences.forEach(sentence => {
    console.log(`Sentence: ${sentence.text.content}`);
    console.log(`  Score: ${sentence.sentiment.score}`);
    console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
  });

  // [END language_sentiment_file]
}

async function analyzeEntitiesOfText(text) {
  // [START language_entities_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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

  // Detects entities in the document
  const [result] = await client.analyzeEntities({document});
  const entities = result.entities;

  console.log('Entities:');
  entities.forEach(entity => {
    console.log(entity.name);
    console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    if (entity.metadata && entity.metadata.wikipedia_url) {
      console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
    }
  });

  // [END language_entities_string]
}

async function analyzeEntitiesInFile(bucketName, fileName) {
  // [START language_entities_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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

  // Detects entities in the document
  const [result] = await client.analyzeEntities({document});
  const entities = result.entities;

  console.log('Entities:');
  entities.forEach(entity => {
    console.log(entity.name);
    console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    if (entity.metadata && entity.metadata.wikipedia_url) {
      console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
    }
  });

  // [END language_entities_file]
}

async function analyzeSyntaxOfText(text) {
  // [START language_syntax_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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

  // Detects syntax in the document
  const [syntax] = await client.analyzeSyntax({document});

  console.log('Parts of speech:');
  syntax.tokens.forEach(part => {
    console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    console.log(`Morphology:`, part.partOfSpeech);
  });

  // [END language_syntax_string]
}

async function analyzeSyntaxInFile(bucketName, fileName) {
  // [START language_syntax_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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

  // Detects syntax in the document
  const [syntax] = await client.analyzeSyntax({document});

  console.log('Parts of speech:');
  syntax.tokens.forEach(part => {
    console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    console.log(`Morphology:`, part.partOfSpeech);
  });
  // [END language_syntax_file]
}

async function classifyTextOfText(text) {
  // [START language_classify_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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
  // [END language_classify_string]
}

async function classifyTextInFile(bucketName, fileName) {
  // [START language_classify_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language').v1beta2;

  // Creates a v1beta2 client
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

  // Classifies text in the document
  const [classification] = await client.classifyText({document});
  console.log('Categories:');
  classification.categories.forEach(category => {
    console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
  });
  // [END language_classify_file]
}

require(`yargs`)
  .demand(1)
  .command(
    `sentiment-text <text>`,
    `Detects sentiment of a string.`,
    {},
    opts => analyzeSentimentOfText(opts.text)
  )
  .command(
    `sentiment-file <bucketName> <fileName>`,
    `Detects sentiment in a file in Google Cloud Storage.`,
    {},
    opts => analyzeSentimentInFile(opts.bucketName, opts.fileName)
  )
  .command(`entities-text <text>`, `Detects entities in a string.`, {}, opts =>
    analyzeEntitiesOfText(opts.text)
  )
  .command(
    `entities-file <bucketName> <fileName>`,
    `Detects entities in a file in Google Cloud Storage.`,
    {},
    opts => analyzeEntitiesInFile(opts.bucketName, opts.fileName)
  )
  .command(`syntax-text <text>`, `Detects syntax of a string.`, {}, opts =>
    analyzeSyntaxOfText(opts.text)
  )
  .command(
    `syntax-file <bucketName> <fileName>`,
    `Detects syntax in a file in Google Cloud Storage.`,
    {},
    opts => analyzeSyntaxInFile(opts.bucketName, opts.fileName)
  )
  .command(`classify-text <text>`, `Classifies text of a string.`, {}, opts =>
    classifyTextOfText(opts.text)
  )
  .command(
    `classify-file <bucketName> <fileName>`,
    `Classifies text in a file in Google Cloud Storage.`,
    {},
    opts => classifyTextInFile(opts.bucketName, opts.fileName)
  )
  .example(
    `node $0 sentiment-text "President Obama is speaking at the White House."`
  )
  .example(
    `node $0 sentiment-file my-bucket file.txt`,
    `Detects sentiment in gs://my-bucket/file.txt`
  )
  .example(
    `node $0 entities-text "President Obama is speaking at the White House."`
  )
  .example(
    `node $0 entities-file my-bucket file.txt`,
    `Detects entities in gs://my-bucket/file.txt`
  )
  .example(
    `node $0 syntax-text "President Obama is speaking at the White House."`
  )
  .example(
    `node $0 syntax-file my-bucket file.txt`,
    `Detects syntax in gs://my-bucket/file.txt`
  )
  .example(
    `node $0 classify-text "Android is a mobile operating system developed by Google, based on the Linux kernel and designed primarily for touchscreen mobile devices such as smartphones and tablets."`
  )
  .example(
    `node $0 classify-file my-bucket android_text.txt`,
    `Detects syntax in gs://my-bucket/android_text.txt`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/natural-language/docs`
  )
  .help()
  .strict().argv;
