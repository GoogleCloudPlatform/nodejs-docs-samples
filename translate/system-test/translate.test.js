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

const Translate = require(`@google-cloud/translate`);
const path = require(`path`);
const run = require(`../../utils`).run;

const cwd = path.join(__dirname, `..`);
const cmd = `node translate.js`;
const text = `Hello world!`;
const text2 = `Goodbye!`;
const toLang = `ru`;

describe(`translate:translate`, () => {
  const translate = Translate();

  it(`should detect language of a single string`, () => {
    const output = run(`${cmd} detect "${text}"`, cwd);
    return translate.detect(text)
      .then((results) => {
        const expected = `Detections:\n${text} => ${results[0].language}`;
        assert.equal(output, expected);
      });
  });

  it(`should detect language of multiple strings`, () => {
    const output = run(`${cmd} detect "${text}" "${text2}"`, cwd);
    return translate.detect([text, text2])
      .then((results) => {
        const expected = `Detections:\n${text} => ${results[0][0].language}\n${text2} => ${results[0][1].language}`;
        assert.equal(output, expected);
      });
  });

  it(`should list languages`, () => {
    const output = run(`${cmd} list`, cwd);
    assert.equal(output.includes(`Languages:`), true);
    assert.equal(output.includes(`{ code: 'af', name: 'Afrikaans' }`), true);
  });

  it(`should list languages with a target`, () => {
    const output = run(`${cmd} list es`, cwd);
    assert.equal(output.includes(`Languages:`), true);
    assert.equal(output.includes(`{ code: 'af', name: 'afrikáans' }`), true);
  });

  it(`should translate a single string`, () => {
    const output = run(`${cmd} translate ${toLang} "${text}"`, cwd);
    return translate.translate(text, toLang)
      .then((results) => {
        const expected = `Translations:\n${text} => (${toLang}) ${results[0]}`;
        assert.equal(output, expected);
      });
  });

  it(`should translate multiple strings`, () => {
    const output = run(`${cmd} translate ${toLang} "${text}" "${text2}"`, cwd);
    return translate.translate([text, text2], toLang)
      .then((results) => {
        const expected = `Translations:\n${text} => (${toLang}) ${results[0][0]}\n${text2} => (${toLang}) ${results[0][1]}`;
        assert.equal(output, expected);
      });
  });
});
