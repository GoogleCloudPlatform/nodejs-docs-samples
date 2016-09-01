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

// [START setup]
// By default, the client will use the project specified by the GCLOUD_PROJECT
// environment variable. The Translate API uses an API key for authentication.
// See https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Translate = require('@google-cloud/translate');
// [END setup]

function detectLanguage (input, callback) {
  var translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // at an environment variable for the key.
    key: process.env.TRANSLATE_API_KEY
  });

  // "input" can be a string for detecting the language of a single piece of
  // text, or an array of strings for detecting the languages of multiple texts.
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate?method=detect
  translate.detect(input, function (err, result, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Detected language(s):', result);
    return callback(null, result, apiResponse);
  });
}

function listLanguages (callback) {
  var translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // at an environment variable for the key.
    key: process.env.TRANSLATE_API_KEY
  });

  // List available translation language with their names in English (the default).
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate?method=getLanguages
  translate.getLanguages(function (err, languages, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d language(s)!', languages.length);
    return callback(null, languages, apiResponse);
  });
}

function listLanguagesWithTarget (target, callback) {
  var translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // at an environment variable for the key.
    key: process.env.TRANSLATE_API_KEY
  });

  // List available translation language with their names in the target language.
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate?method=getLanguages
  translate.getLanguages(target, function (err, languages, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d language(s)!', languages.length);
    return callback(null, languages, apiResponse);
  });
}

// [START translate_text]
// Helper library for language codes
var ISO6391 = require('iso-639-1');

function translateText (input, toLang, fromLang, callback) {
  var translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // at an environment variable for the key.
    key: process.env.TRANSLATE_API_KEY
  });

  // "input" can be a string for translating a single piece of text, or an array
  // of strings for translating multiple texts.
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/translate/latest/translate?method=translate
  translate.translate(input, {
    from: fromLang,
    to: toLang
  }, function (err, translation, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Translated to %s:', ISO6391.getName(toLang));
    return callback(null, translation, apiResponse);
  });
}
// [END translate_text]

// The command-line program
var cli = require('yargs');
var utils = require('../utils');

var program = module.exports = {
  detectLanguage: detectLanguage,
  listLanguages: listLanguages,
  listLanguagesWithTarget: listLanguagesWithTarget,
  translateText: translateText,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('detect <input..>', 'Detect the language of the provided text or texts', {}, function (options) {
    if (!process.env.TRANSLATE_API_KEY) {
      process.env.TRANSLATE_API_KEY = options.apiKey;
    }
    program.detectLanguage(options.input, utils.makeHandler(false));
  })
  .command('list [target]', 'List available translation languages. To return language names in a language other than English, specify a target language.', {}, function (options) {
    if (!process.env.TRANSLATE_API_KEY) {
      process.env.TRANSLATE_API_KEY = options.apiKey;
    }
    if (options.target) {
      program.listLanguagesWithTarget(options.target, utils.makeHandler());
    } else {
      program.listLanguages(utils.makeHandler());
    }
  })
  .command('translate <toLang> <input..>', 'Translate the provided text or texts to the target language, optionally specifying the source language.', {
    fromLang: {
      alias: 'f',
      requiresArg: true,
      type: 'string',
      description: 'The language of the source text.'
    }
  }, function (options) {
    if (!process.env.TRANSLATE_API_KEY) {
      process.env.TRANSLATE_API_KEY = options.apiKey;
    }
    program.translateText(options.input, options.toLang, options.fromLang, utils.makeHandler());
  })
  .option('apiKey', {
    alias: 'k',
    global: true,
    requiresArg: true,
    default: process.env.TRANSLATE_API_KEY,
    type: 'string',
    description: 'Your Translate API key. Defaults to the value of the TRANSLATE_API_KEY environment variable.'
  })
  .example('node $0 detect "Hello world!"', 'Detect the language of "Hello world!".')
  .example('node $0 detect -k your-api-key "Hello world!" "Goodbye"', 'Detect the language of "Hello world!" and "Goodbye", supplying the API key inline..')
  .example('node $0 list -k your-api-key', 'List available translation languages with names in English, supplying the API key inline..')
  .example('node $0 list es', 'List available translation languages with names in Spanish.')
  .example('node $0 translate ru "Good morning!"', 'Translate "Good morning!" to Russian, auto-detecting the source language.')
  .example('node $0 translate ru "Good morning!" -f en -k your-api-key', 'Translate "Good morning!" to Russian from English, supplying the API key inline.')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/translate/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
