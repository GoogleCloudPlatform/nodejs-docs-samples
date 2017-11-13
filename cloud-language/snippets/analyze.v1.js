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

function analyzeSentimentOfText(text) {
  // [START language_sentiment_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects the sentiment of the document
  client
    .analyzeSentiment({document: document})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      console.log(`Document sentiment:`);
      console.log(`  Score: ${sentiment.score}`);
      console.log(`  Magnitude: ${sentiment.magnitude}`);

      const sentences = results[0].sentences;
      sentences.forEach(sentence => {
        console.log(`Sentence: ${sentence.text.content}`);
        console.log(`  Score: ${sentence.sentiment.score}`);
        console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_sentiment_string]
}

function analyzeSentimentInFile(bucketName, fileName) {
  // [START language_sentiment_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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
  client
    .analyzeSentiment({document: document})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      console.log(`Document sentiment:`);
      console.log(`  Score: ${sentiment.score}`);
      console.log(`  Magnitude: ${sentiment.magnitude}`);

      const sentences = results[0].sentences;
      sentences.forEach(sentence => {
        console.log(`Sentence: ${sentence.text.content}`);
        console.log(`  Score: ${sentence.sentiment.score}`);
        console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_sentiment_file]
}

function analyzeEntitiesOfText(text) {
  // [START language_entities_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects entities in the document
  client
    .analyzeEntities({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log('Entities:');
      entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entities_string]
}

function analyzeEntitiesInFile(bucketName, fileName) {
  // [START language_entities_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects entities in the document
  client
    .analyzeEntities({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log('Entities:');
      entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entities_file]
}

function analyzeSyntaxOfText(text) {
  // [START language_syntax_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects syntax in the document
  client
    .analyzeSyntax({document: document})
    .then(results => {
      const syntax = results[0];

      console.log('Tokens:');
      syntax.tokens.forEach(part => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        console.log(`Morphology:`, part.partOfSpeech);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_syntax_string]
}

function analyzeSyntaxInFile(bucketName, fileName) {
  // [START language_syntax_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects syntax in the document
  client
    .analyzeSyntax({document: document})
    .then(results => {
      const syntax = results[0];

      console.log('Parts of speech:');
      syntax.tokens.forEach(part => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        console.log(`Morphology:`, part.partOfSpeech);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_syntax_file]
}

function analyzeEntitySentimentOfText(text) {
  // [START language_entity_sentiment_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects sentiment of entities in the document
  client
    .analyzeEntitySentiment({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log(`Entities and sentiments:`);
      entities.forEach(entity => {
        console.log(`  Name: ${entity.name}`);
        console.log(`  Type: ${entity.type}`);
        console.log(`  Score: ${entity.sentiment.score}`);
        console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entity_sentiment_string]
}

function analyzeEntitySentimentInFile(bucketName, fileName) {
  // [START language_entity_sentiment_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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

  // Detects sentiment of entities in the document
  client
    .analyzeEntitySentiment({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log(`Entities and sentiments:`);
      entities.forEach(entity => {
        console.log(`  Name: ${entity.name}`);
        console.log(`  Type: ${entity.type}`);
        console.log(`  Score: ${entity.sentiment.score}`);
        console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entity_sentiment_file]
}

function classifyTextOfText(text) {
  // [START language_classify_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

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
  client
    .classifyText({document: document})
    .then(results => {
      const classification = results[0];

      console.log('Categories:');
      classification.categories.forEach(category => {
        console.log(
          `Name: ${category.name}, Confidence: ${category.confidence}`
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_classify_string]
}

function classifyTextInFile(bucketName, fileName) {
  // [START language_classify_file]
  // Imports the Google Cloud client library.
  const language = require('@google-cloud/language');

  // Creates a client.
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
  client
    .classifyText({document: document})
    .then(results => {
      const classification = results[0];

      console.log('Categories:');
      classification.categories.forEach(category => {
        console.log(
          `Name: ${category.name}, Confidence: ${category.confidence}`
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
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
  .command(
    `entity-sentiment-text <text>`,
    `Detects sentiment of the entities in a string.`,
    {},
    opts => analyzeEntitySentimentOfText(opts.text)
  )
  .command(
    `entity-sentiment-file <bucketName> <fileName>`,
    `Detects sentiment of the entities in a file in Google Cloud Storage.`,
    {},
    opts => analyzeEntitySentimentInFile(opts.bucketName, opts.fileName)
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
    `node $0 entity-sentiment-text "President Obama is speaking at the White House."`
  )
  .example(
    `node $0 entity-sentiment-file my-bucket file.txt`,
    `Detects sentiment of entities in gs://my-bucket/file.txt`
  )
  .example(
    `node $0 classify-text "Android is a mobile operating system developed by Google."`
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
