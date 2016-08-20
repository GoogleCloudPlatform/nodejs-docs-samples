// Copyright 2016, Google, Inc.
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
var Translate = require('@google-cloud/translate');

var ISO6391 = require('iso-639-1');
// [END setup]

// [START detect_language]
/**
 * Detect the language of the provided text.
 *
 * @param {string} text The text for which to detect the language.
 * @param {string} key Your Translate API key.
 * @param {function} cb The callback function.
 */
function detectLanguage (text, key, callback) {
  // Instantiate a translate client
  var translate = Translate({
    key: key
  });

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate
  translate.detect(text, function (err, result) {
    if (err) {
      return callback(err);
    }

    console.log('Detected %s with confidence %d', ISO6391.getName(result.language), result.confidence);
    return callback(null, result);
  });
}
// [END detect_language]

// [START list_languages]
/**
 * List all of the authenticated project's buckets.
 *
 * @param {string} key Your Translate API key.
 * @param {function} cb The callback function.
 */
function listLanguages (key, callback) {
  // Instantiate a translate client
  var translate = Translate({
    key: key
  });

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate
  translate.getLanguages(function (err, languages) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d language(s)!', languages.length);
    return callback(null, languages);
  });
}
// [END list_languages]

// [START translate_text]
/**
 * Translate the provided text.
 *
 * @param {object} options Configuration options.
 * @param {string} options.text The text to translate.
 * @param {string} options.from The language of the source text.
 * @param {string} options.to The language to which to translate the text.
 * @param {string} options.key Your Translate API key.
 * @param {function} cb The callback function.
 */
function translateText (options, callback) {
  // Instantiate a translate client
  var translate = Translate({
    key: options.key
  });

  var config = {
    from: options.from,
    to: options.to
  };

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate
  translate.translate(options.text, config, function (err, translation) {
    if (err) {
      return callback(err);
    }

    console.log('Translated text to %s', ISO6391.getName(options.to));
    return callback(null, translation);
  });
}
// [END translate_text]
// [END all]

// The command-line program
var cli = require('yargs');

var program = module.exports = {
  detectLanguage: detectLanguage,
  listLanguages: listLanguages,
  translateText: translateText,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('detect <text>', 'Detect the language of the provided text', {}, function (options) {
    program.detectLanguage(options.text, options.key, console.log);
  })
  .command('list', 'List available translation languages.', {}, function (options) {
    program.listLanguages(options.key, console.log);
  })
  .command('translate <text>', 'Translate the provided text to the target language.', {
    to: {
      alias: 't',
      demand: true,
      requiresArg: true,
      type: 'string',
      description: 'The language to which to translate the text.'
    },
    from: {
      alias: 'f',
      requiresArg: true,
      type: 'string',
      description: 'The language of the source text.'
    }
  }, function (options) {
    program.translateText(options, console.log);
  })
  .option('key', {
    alias: 'k',
    global: true,
    demand: true,
    requiresArg: true,
    type: 'string'
  })
  .example('node $0 detect "Hello world!"', 'Detect the language of "Hello world!".')
  .example('node $0 list', 'List available translation languages.')
  .example('node $0 translate --to ru "Good morning!"', 'Translate "Good morning!" to Russian, auto-detecting English.')
  .example('node $0 translate --key asdfqwerzxcv --to ru --from en "Good morning!"', 'Translate "Good morning!" to Russian from English.')
  .wrap(80)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/translate/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
