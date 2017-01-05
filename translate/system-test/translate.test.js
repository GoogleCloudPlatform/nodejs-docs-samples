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

require(`../../system-test/_setup`);

const translate = require(`@google-cloud/translate`)();
const path = require(`path`);

const cwd = path.join(__dirname, `..`);
const cmd = `node translate.js`;
const text = `Hello world!`;
const text2 = `Goodbye!`;
const model = `nmt`;
const toLang = `ru`;

test(`should detect language of a single string`, async (t) => {
  const output = await runAsync(`${cmd} detect "${text}"`, cwd);
  const [detection] = await translate.detect(text);
  const expected = `Detections:\n${text} => ${detection.language}`;
  t.is(output, expected);
});

test(`should detect language of multiple strings`, async (t) => {
  const output = await runAsync(`${cmd} detect "${text}" "${text2}"`, cwd);
  const [detections] = await translate.detect([text, text2]);
  const expected = `Detections:\n${text} => ${detections[0].language}\n${text2} => ${detections[1].language}`;
  t.is(output, expected);
});

test(`should list languages`, async (t) => {
  const output = await runAsync(`${cmd} list`, cwd);
  t.true(output.includes(`Languages:`));
  t.true(output.includes(`{ code: 'af', name: 'Afrikaans' }`));
});

test(`should list languages with a target`, async (t) => {
  const output = await runAsync(`${cmd} list es`, cwd);
  t.true(output.includes(`Languages:`));
  t.true(output.includes(`{ code: 'af', name: 'afrikáans' }`));
});

test(`should translate a single string`, async (t) => {
  const output = await runAsync(`${cmd} translate ${toLang} "${text}"`, cwd);
  const [translation] = await translate.translate(text, toLang);
  const expected = `Translations:\n${text} => (${toLang}) ${translation}`;
  t.is(output, expected);
});

test(`should translate multiple strings`, async (t) => {
  const output = await runAsync(`${cmd} translate ${toLang} "${text}" "${text2}"`, cwd);
  const [translations] = await translate.translate([text, text2], toLang);
  const expected = `Translations:\n${text} => (${toLang}) ${translations[0]}\n${text2} => (${toLang}) ${translations[1]}`;
  t.is(output, expected);
});

test(`should translate a single string with a model`, async (t) => {
  const output = await runAsync(`${cmd} translate-with-model ${toLang} ${model} "${text}"`, cwd);
  const [translation] = await translate.translate(text, toLang);
  const expected = `Translations:\n${text} => (${toLang}) ${translation}`;
  t.is(output, expected);
});

test(`should translate multiple strings with a model`, async (t) => {
  const output = await runAsync(`${cmd} translate-with-model ${toLang} ${model} "${text}" "${text2}"`, cwd);
  const [translations] = await translate.translate([text, text2], toLang);
  const expected = `Translations:\n${text} => (${toLang}) ${translations[0]}\n${text2} => (${toLang}) ${translations[1]}`;
  t.is(output, expected);
});
