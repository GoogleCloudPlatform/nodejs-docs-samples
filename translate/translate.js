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

function detectLanguageSample(text) {
  // [START translate_detect_language]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const text = 'The text for which to detect language, e.g. Hello, world!';

  // Detects the language. "text" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  async function detectLanguage() {
    let [detections] = await translate.detect(text);
    detections = Array.isArray(detections) ? detections : [detections];
    console.log('Detections:');
    detections.forEach(detection => {
      console.log(`${detection.input} => ${detection.language}`);
    });
  }

  detectLanguage();
  // [END translate_detect_language]
}

function listLanguagesSample() {
  // [START translate_list_codes]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate();

  async function listLanguages() {
    // Lists available translation language with their names in English (the default).
    const [languages] = await translate.getLanguages();

    console.log('Languages:');
    languages.forEach(language => console.log(language));
  }

  listLanguages();
  // [END translate_list_codes]
}

function listLanguagesWithTargetSample(target) {
  // [START translate_list_language_names]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const target = 'The target language for language names, e.g. ru';

  async function listLanguagesWithTarget() {
    // Lists available translation language with their names in a target language
    const [languages] = await translate.getLanguages(target);

    console.log('Languages:');
    languages.forEach(language => console.log(language));
  }

  listLanguagesWithTarget();
  // [END translate_list_language_names]
}

function translateTextSample(text, target) {
  // [START translate_translate_text]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'The text to translate, e.g. Hello, world!';
  // const target = 'The target language, e.g. ru';

  async function translateText() {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log('Translations:');
    translations.forEach((translation, i) => {
      console.log(`${text[i]} => (${target}) ${translation}`);
    });
  }

  translateText();
  // [END translate_translate_text]
}

function translateTextWithModelSample(text, target, model) {
  // [START translate_text_with_model]
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'The text to translate, e.g. Hello, world!';
  // const target = 'The target language, e.g. ru';
  // const model = 'The model to use, e.g. nmt';

  async function translateTextWithModel() {
    const options = {
      // The target language, e.g. "ru"
      to: target,
      // Make sure your project is on the allow list.
      // Possible values are "base" and "nmt"
      model: model,
    };

    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations] = await translate.translate(text, options);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log('Translations:');
    translations.forEach((translation, i) => {
      console.log(`${text[i]} => (${target}) ${translation}`);
    });
  }

  translateTextWithModel();
  // [END translate_text_with_model]
}

require('yargs')
  .demand(1)
  .command(
    'detect <text..>',
    'Detects the language of one or more strings.',
    {},
    async opts => await detectLanguageSample(opts.text)
  )
  .command(
    'list [target]',
    'Lists available translation languages. To language names in a language other than English, specify a target language.',
    {},
    async opts => {
      if (opts.target) {
        await listLanguagesWithTargetSample(opts.target);
      } else {
        await listLanguagesSample();
      }
    }
  )
  .command(
    'translate <toLang> <text..>',
    'Translates one or more strings into the target language.',
    {},
    async opts => await translateTextSample(opts.text, opts.toLang)
  )
  .command(
    'translate-with-model <toLang> <model> <text..>',
    'Translates one or more strings into the target language using the specified model.',
    {},
    async opts =>
      await translateTextWithModelSample(opts.text, opts.toLang, opts.model)
  )
  .example('node $0 detect "Hello world!"', 'Detects the language of a string.')
  .example(
    'node $0 detect "Hello world!" "Goodbye"',
    'Detects the languages of multiple strings.'
  )
  .example(
    'node $0 list',
    'Lists available translation languages with names in English.'
  )
  .example(
    'node $0 list es',
    'Lists available translation languages with names in Spanish.'
  )
  .example(
    'node $0 translate ru "Good morning!"',
    'Translates a string into Russian.'
  )
  .example(
    'node $0 translate ru "Good morning!" "Good night!"',
    'Translates multiple strings into Russian.'
  )
  .example(
    'node $0 translate-with-model ru nmt "Good morning!" "Good night!"',
    'Translates multiple strings into Russian using the Premium model.'
  )
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/translate/docs')
  .help()
  .strict().argv;
