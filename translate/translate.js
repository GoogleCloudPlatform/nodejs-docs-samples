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

const Translate = require('@google-cloud/translate');

// [START translate_detect_language]
function detectLanguage (input, callback) {
  // Instantiates a client
  const translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // for the key in an environment variable.
    key: process.env.TRANSLATE_API_KEY
  });

  // Detects the language. "input" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  translate.detect(input, (err, result) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Detected: %j', result);
    callback();
  });
}
// [END translate_detect_language]

// [START translate_list_codes]
function listLanguages (callback) {
  // Instantiates a client
  const translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // for the key in an environment variable.
    key: process.env.TRANSLATE_API_KEY
  });

  // Lists available translation language with their names in English (the default).
  translate.getLanguages((err, languages) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Languages:');
    languages.forEach((language) => console.log(language));
    callback();
  });
}
// [END translate_list_codes]

// [START translate_list_language_names]
function listLanguagesWithTarget (target, callback) {
  // Instantiates a client
  const translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // for the key in an environment variable.
    key: process.env.TRANSLATE_API_KEY
  });

  // Lists available translation language with their names in a target language
  translate.getLanguages(target, (err, languages) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Languages:');
    languages.forEach((language) => console.log(language));
    callback();
  });
}
// [END translate_list_language_names]

// [START translate_translate_text]
function translateText (input, target, callback) {
  // Instantiates a client
  const translate = Translate({
    // The Translate API uses an API key for authentication. This sample looks
    // for the key in an environment variable.
    key: process.env.TRANSLATE_API_KEY
  });

  // Translates the text into the target language. "input" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  translate.translate(input, target, (err, translation) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Text: %j', input);
    console.log('Translation: %j', translation);
    callback();
  });
}
// [END translate_translate_text]

// The command-line program
const cli = require(`yargs`);
const noop = require(`../utils`).noop;

const program = module.exports = {
  detectLanguage: detectLanguage,
  listLanguages: listLanguages,
  listLanguagesWithTarget: listLanguagesWithTarget,
  translateText: translateText,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`detect <input..>`, `Detects the language of the provided text or texts`, {}, (opts) => {
    if (!process.env.TRANSLATE_API_KEY) {
      process.env.TRANSLATE_API_KEY = opts.apiKey;
    }
    program.detectLanguage(opts.input, noop);
  })
  .command(`list [target]`, `Lists available translation languages. To return language names in a language other than English, specify a target language.`, {}, (opts) => {
    if (!process.env.TRANSLATE_API_KEY) {
      process.env.TRANSLATE_API_KEY = opts.apiKey;
    }
    if (opts.target) {
      program.listLanguagesWithTarget(opts.target, noop);
    } else {
      program.listLanguages(noop);
    }
  })
  .command(`translate <toLang> <input..>`, `Translates the provided text or texts to the target language.`, {}, (opts) => {
    if (!process.env.TRANSLATE_API_KEY) {
      process.env.TRANSLATE_API_KEY = opts.apiKey;
    }
    program.translateText(opts.input, opts.toLang, noop);
  })
  .option(`apiKey`, {
    alias: `k`,
    global: true,
    requiresArg: true,
    default: process.env.TRANSLATE_API_KEY,
    type: `string`,
    description: `Your Translate API key. Defaults to the value of the TRANSLATE_API_KEY environment variable.`
  })
  .example(`node $0 detect "Hello world!"`, `Detects the language of "Hello world!".`)
  .example(`node $0 detect -k YOUR_API_KEY "Hello world!" "Goodbye"`, `Detects the language of "Hello world!" and "Goodbye", supplying the API key inline.`)
  .example(`node $0 list -k YOUR_API_KEY`, `Lists available translation languages with names in English, supplying the API key inline.`)
  .example(`node $0 list es`, `Lists available translation languages with names in Spanish.`)
  .example(`node $0 translate ru "Good morning!"`, `Translates "Good morning!" to Russian, auto-detecting the source language.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/translate/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
