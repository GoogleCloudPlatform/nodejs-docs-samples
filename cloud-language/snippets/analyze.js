// Copyright 2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START all]
// [START setup]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Language = require('@google-cloud/language');
var Storage = require('@google-cloud/storage');

// Instantiate the language client
var language = Language();
// Instantiate the storage client
var storage = Storage();
// [END setup]

// [START analyze_sentiment_from_string]
/**
 * Detect the sentiment of a block of text.
 *
 * @param {string} text The text to analyze.
 * @param {object} [options] Configuration options.
 * @param {string} [options.type] The type of the text, either "text" or "html".
 * @param {string} [options.language] The language of the text, e.g. "en".
 * @param {function} callback The callback function.
 */
function analyzeSentimentFromString (text, options, callback) {
  var document = language.document({
    content: text,
    type: options.type,
    language: options.language
  });

  var config = {
    // Get more detailed results
    verbose: true
  };

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/language/latest/language/document
  document.detectSentiment(config, function (err, sentiment) {
    if (err) {
      return callback(err);
    }

    console.log('Found %s sentiment', sentiment.polarity >= 0 ? 'positive' : 'negative');
    return callback(null, sentiment);
  });
}
// [END analyze_sentiment_from_string]

// [START analyze_sentiment_from_file]
/**
 * Detect the sentiment in a text file that resides in Google Cloud Storage.
 *
 * @param {string} bucket The bucket where the file resides.
 * @param {string} filename The name of the file to be analyzed.
 * @param {object} [options] Optional configuration.
 * @param {string} [options.language] The language of the text, e.g. "en".
 * @param {string} [options.type] The type of the text, either "text" or "html".
 * @param {function} callback The callback function.
 */
function analyzeSentimentFromFile (bucket, filename, options, callback) {
  var document = language.document({
    content: storage.bucket(bucket).file(filename),
    type: options.type,
    language: options.language
  });

  var config = {
    // Get more detailed results
    verbose: true
  };

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/language/latest/language/document
  document.detectSentiment(config, function (err, sentiment) {
    if (err) {
      return callback(err);
    }

    console.log('Found %s sentiment', sentiment.polarity >= 0 ? 'positive' : 'negative');
    return callback(null, sentiment);
  });
}
// [END analyze_sentiment_from_file]

// [START analyze_entities_from_string]
/**
 * Detect the entities from a block of text.
 *
 * @param {string} text The text to analyze.
 * @param {object} [options] Optional configuration.
 * @param {string} [options.language] The language of the text, e.g. "en".
 * @param {string} [options.type] The type of the text, either "text" or "html".
 * @param {function} callback The callback function.
 */
function analyzeEntitiesFromString (text, options, callback) {
  var document = language.document({
    content: text,
    type: options.type,
    language: options.language
  });

  var config = {
    // Get more detailed results
    verbose: true
  };

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/language/latest/language/document
  document.detectEntities(config, function (err, entities) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d entity type(s)!', Object.keys(entities).length);
    return callback(null, entities);
  });
}
// [END analyze_entities_from_string]

// [START analyze_entities_from_file]
/**
 * Detect the entities in a text file that resides in Google Cloud Storage.
 *
 * @param {string} bucket The bucket where the file resides.
 * @param {string} filename The name of the file to be analyzed.
 * @param {object} [options] Optional configuration.
 * @param {string} [options.language] The language of the text, e.g. "en".
 * @param {string} [options.type] The type of the text, either "text" or "html".
 * @param {function} callback The callback function.
 */
function analyzeEntitiesFromFile (bucket, filename, options, callback) {
  var document = language.document({
    content: storage.bucket(bucket).file(filename),
    type: options.type,
    language: options.language
  });

  var config = {
    // Get more detailed results
    verbose: true
  };

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/language/latest/language/document
  document.detectEntities(config, function (err, entities) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d entity type(s)!', Object.keys(entities).length);
    return callback(null, entities);
  });
}
// [END analyze_entities_from_file]

// [START analyze_syntax_from_string]
/**
 * Detect the syntax in a block of text.
 *
 * @param {string} text The text to analyze.
 * @param {object} [options] Optional configuration.
 * @param {string} [options.language] The language of the text, e.g. "en".
 * @param {string} [options.type] The type of the text, either "text" or "html".
 * @param {function} callback The callback function.
 */
function analyzeSyntaxFromString (text, options, callback) {
  var document = language.document({
    content: text,
    type: options.type,
    language: options.language
  });

  var config = {
    syntax: true
  };

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/language/latest/language/document
  document.annotate(config, function (err, result, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Done analyzing syntax');
    return callback(null, apiResponse);
  });
}
// [END analyze_syntax_from_string]

// [START analyze_syntax_from_file]
/**
 * Detect the syntax in a text file that resides in Google Cloud Storage.
 *
 * @param {string} bucket The bucket where the file resides.
 * @param {string} filename The name of the file to be analyzed.
 * @param {object} [options] Optional configuration.
 * @param {string} [options.language] The language of the text, e.g. "en".
 * @param {string} [options.type] The type of the text, either "text" or "html".
 * @param {function} callback The callback function.
 */
function analyzeSyntaxFromFile (bucket, filename, options, callback) {
  var document = language.document({
    content: storage.bucket(bucket).file(filename),
    type: options.type,
    language: options.language
  });

  var config = {
    syntax: true
  };

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/language/latest/language/document
  document.annotate(config, function (err, result, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Done analyzing syntax');
    return callback(null, apiResponse);
  });
}
// [END analyze_syntax_from_file]
// [END all]

// The command-line program
var cli = require('yargs');
var utils = require('../utils');

var program = module.exports = {
  analyzeSentimentFromString: analyzeSentimentFromString,
  analyzeSentimentFromFile: analyzeSentimentFromFile,
  analyzeEntitiesFromString: analyzeEntitiesFromString,
  analyzeEntitiesFromFile: analyzeEntitiesFromFile,
  analyzeSyntaxFromString: analyzeSyntaxFromString,
  analyzeSyntaxFromFile: analyzeSyntaxFromFile,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('sentimentFromString <text>', 'Detect the sentiment of a block of text.', {}, function (options) {
    program.analyzeSentimentFromString(options.text, utils.pick(options, ['language', 'type']), utils.makeHandler());
  })
  .command('sentimentFromFile <bucket> <filename>', 'Detect the sentiment of text in a GCS file.', {}, function (options) {
    program.analyzeSentimentFromFile(options.bucket, options.filename, utils.pick(options, ['language', 'type']), utils.makeHandler());
  })
  .command('entitiesFromString <text>', 'Detect the entities of a block of text.', {}, function (options) {
    program.analyzeEntitiesFromString(options.text, utils.pick(options, ['language', 'type']), utils.makeHandler());
  })
  .command('entitiesFromFile <bucket> <filename>', 'Detect the entities of text in a GCS file.', {}, function (options) {
    program.analyzeEntitiesFromFile(options.bucket, options.filename, utils.pick(options, ['language', 'type']), utils.makeHandler());
  })
  .command('syntaxFromString <text>', 'Detect the syntax of a block of text.', {}, function (options) {
    program.analyzeSyntaxFromString(options.text, utils.pick(options, ['language', 'type']), utils.makeHandler());
  })
  .command('syntaxFromFile <bucket> <filename>', 'Detect the syntax of text in a GCS file.', {}, function (options) {
    program.analyzeSyntaxFromFile(options.bucket, options.filename, utils.pick(options, ['language', 'type']), utils.makeHandler());
  })
  .options({
    language: {
      alias: 'l',
      type: 'string',
      requiresArg: true,
      description: 'The language of the text.',
      global: true
    },
    type: {
      alias: 't',
      type: 'string',
      choices: ['text', 'html'],
      default: 'text',
      requiresArg: true,
      description: 'Type of text.',
      global: true
    }
  })
  .example('node $0 sentimentFromString "President Obama is speaking at the White House."', '')
  .example('node $0 sentimentFromFile my-bucket file.txt', '')
  .example('node $0 entitiesFromString "<p>President Obama is speaking at the White House.</p>" -t html', '')
  .example('node $0 entitiesFromFile my-bucket file.txt', '')
  .example('node $0 syntaxFromString "President Obama is speaking at the White House."', '')
  .example('node $0 syntaxFromFile my-bucket es_file.txt -l es', '')
  .wrap(100)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/natural-language/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
