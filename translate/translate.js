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

function detectLanguage(text) {
  // [START translate_detect_language]
  // Imports the Google Cloud client library
  const Translate = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const text = 'The text for which to detect language, e.g. Hello, world!';

  // Detects the language. "text" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  translate
    .detect(text)
    .then(results => {
      let detections = results[0];
      detections = Array.isArray(detections) ? detections : [detections];

      console.log('Detections:');
      detections.forEach(detection => {
        console.log(`${detection.input} => ${detection.language}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END translate_detect_language]
}

function listLanguages() {
  // [START translate_list_codes]
  // Imports the Google Cloud client library
  const Translate = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  // Lists available translation language with their names in English (the default).
  translate
    .getLanguages()
    .then(results => {
      const languages = results[0];

      console.log('Languages:');
      languages.forEach(language => console.log(language));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END translate_list_codes]
}

function listLanguagesWithTarget(target) {
  // [START translate_list_language_names]
  // Imports the Google Cloud client library
  const Translate = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const target = 'The target language for language names, e.g. ru';

  // Lists available translation language with their names in a target language
  translate
    .getLanguages(target)
    .then(results => {
      const languages = results[0];

      console.log('Languages:');
      languages.forEach(language => console.log(language));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END translate_list_language_names]
}

function translateText(text, target) {
  // [START translate_translate_text]
  // Imports the Google Cloud client library
  const Translate = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'The text to translate, e.g. Hello, world!';
  // const target = 'The target language, e.g. ru';

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  translate
    .translate(text, target)
    .then(results => {
      let translations = results[0];
      translations = Array.isArray(translations)
        ? translations
        : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END translate_translate_text]
}

function translateTextWithModel(text, target, model) {
  // [START translate_text_with_model]
  // Imports the Google Cloud client library
  const Translate = require('@google-cloud/translate');

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'The text to translate, e.g. Hello, world!';
  // const target = 'The target language, e.g. ru';
  // const model = 'The model to use, e.g. nmt';

  const options = {
    // The target language, e.g. "ru"
    to: target,
    // Make sure your project is whitelisted.
    // Possible values are "base" and "nmt"
    model: model,
  };

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  translate
    .translate(text, options)
    .then(results => {
      let translations = results[0];
      translations = Array.isArray(translations)
        ? translations
        : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END translate_text_with_model]
}

require(`yargs`)
  .demand(1)
  .command(
    `detect <text..>`,
    `Detects the language of one or more strings.`,
    {},
    opts => detectLanguage(opts.text)
  )
  .command(
    `list [target]`,
    `Lists available translation languages. To language names in a language other than English, specify a target language.`,
    {},
    opts => {
      if (opts.target) {
        listLanguagesWithTarget(opts.target);
      } else {
        listLanguages();
      }
    }
  )
  .command(
    `translate <toLang> <text..>`,
    `Translates one or more strings into the target language.`,
    {},
    opts => translateText(opts.text, opts.toLang)
  )
  .command(
    `translate-with-model <toLang> <model> <text..>`,
    `Translates one or more strings into the target language using the specified model.`,
    {},
    opts => translateTextWithModel(opts.text, opts.toLang, opts.model)
  )
  .example(`node $0 detect "Hello world!"`, `Detects the language of a string.`)
  .example(
    `node $0 detect "Hello world!" "Goodbye"`,
    `Detects the languages of multiple strings.`
  )
  .example(
    `node $0 list`,
    `Lists available translation languages with names in English.`
  )
  .example(
    `node $0 list es`,
    `Lists available translation languages with names in Spanish.`
  )
  .example(
    `node $0 translate ru "Good morning!"`,
    `Translates a string into Russian.`
  )
  .example(
    `node $0 translate ru "Good morning!" "Good night!"`,
    `Translates multiple strings into Russian.`
  )
  .example(
    `node $0 translate-with-model ru nmt "Good morning!" "Good night!"`,
    `Translates multiple strings into Russian using the Premium model.`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/translate/docs`)
  .help()
  .strict().argv;
