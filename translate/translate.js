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
function detectLanguage (input) {
  // The text for which to detect language, e.g.:
  // input = 'Hello, world';

  // Instantiates a client
  const translate = Translate();

  // Detects the language. "input" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  return translate.detect(input)
    .then((results) => {
      let detections = results[0];

      if (!Array.isArray(detections)) {
        detections = [detections];
      }

      console.log('Detections:');
      detections.forEach((detection) => {
        console.log(`${detection.input} => ${detection.language}`);
      });

      return detections;
    });
}
// [END translate_detect_language]

// [START translate_list_codes]
function listLanguages () {
  // Instantiates a client
  const translate = Translate();

  // Lists available translation language with their names in English (the default).
  return translate.getLanguages()
    .then((results) => {
      const languages = results[0];

      console.log('Languages:');
      languages.forEach((language) => console.log(language));

      return languages;
    });
}
// [END translate_list_codes]

// [START translate_list_language_names]
function listLanguagesWithTarget (target) {
  // The target language for language names, e.g.:
  // target = 'ru';

  // Instantiates a client
  const translate = Translate();

  // Lists available translation language with their names in a target language,
  // e.g. "ru"
  return translate.getLanguages(target)
    .then((results) => {
      const languages = results[0];

      console.log('Languages:');
      languages.forEach((language) => console.log(language));

      return languages;
    });
}
// [END translate_list_language_names]

// [START translate_translate_text]
function translateText (input, target) {
  // The text to translate, e.g.:
  // input = 'Hello, world';
  // The target language, e.g.:
  // target = 'ru';

  if (!Array.isArray(input)) {
    input = [input];
  }

  // Instantiates a client
  const translate = Translate();

  // Translates the text into the target language. "input" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  return translate.translate(input, target)
    .then((results) => {
      let translations = results[0];
      translations = Array.isArray(translations) ? translations : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${input[i]} => (${target}) ${translation}`);
      });

      return translations;
    });
}
// [END translate_translate_text]

// [START translate_text_with_model]
function translateTextWithModel (input, target, model) {
  // The text to translate, e.g.:
  // input = 'Hello, world';
  // The target language, e.g.:
  // target = 'ru';
  // The model to use, e.g.:
  // model = 'nmt';

  if (!Array.isArray(input)) {
    input = [input];
  }

  // Instantiates a client
  const translate = Translate();

  const options = {
    // The target language, e.g. "ru"
    to: target,
    // Make sure your project is whitelisted.
    // Possible values are "base" and "nmt"
    model: model
  };

  // Translates the text into the target language. "input" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  return translate.translate(input, options)
    .then((results) => {
      let translations = results[0];
      translations = Array.isArray(translations) ? translations : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${input[i]} => (${target}) ${translation}`);
      });

      return translations;
    });
}
// [END translate_text_with_model]

require(`yargs`)
  .demand(1)
  .command(
    `detect <input..>`,
    `Detects the language of one or more strings.`,
    {},
    (opts) => detectLanguage(opts.input)
  )
  .command(
    `list [target]`,
    `Lists available translation languages. To return language names in a language other than English, specify a target language.`,
    {},
    (opts) => {
      if (opts.target) {
        listLanguagesWithTarget(opts.target);
      } else {
        listLanguages();
      }
    }
  )
  .command(
    `translate <toLang> <input..>`,
    `Translates one or more strings into the target language.`,
    {},
    (opts) => translateText(opts.input, opts.toLang)
  )
  .command(
    `translate-with-model <toLang> <model> <input..>`,
    `Translates one or more strings into the target language using the specified model.`,
    {},
    (opts) => translateTextWithModel(opts.input, opts.toLang, opts.model)
  )
  .example(`node $0 detect "Hello world!"`, `Detects the language of a string.`)
  .example(`node $0 detect "Hello world!" "Goodbye"`, `Detects the languages of multiple strings.`)
  .example(`node $0 list`, `Lists available translation languages with names in English.`)
  .example(`node $0 list es`, `Lists available translation languages with names in Spanish.`)
  .example(`node $0 translate ru "Good morning!"`, `Translates a string into Russian.`)
  .example(`node $0 translate ru "Good morning!" "Good night!"`, `Translates multiple strings into Russian.`)
  .example(`node $0 translate-with-model ru nmt "Good morning!" "Good night!"`, `Translates multiple strings into Russian using the Premium model.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/translate/docs`)
  .help()
  .strict()
  .argv;
