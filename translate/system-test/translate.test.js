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
const toLang = `ru`;

describe(`translate:translate`, () => {
  const translate = Translate({
    key: process.env.TRANSLATE_API_KEY
  });
  if (!process.env.TRANSLATE_API_KEY) {
    process.stdout.write(`Skipping Translate API tests...\n`);
    return;
  }

  it(`should detect language`, (done) => {
    const output = run(`${cmd} detect "${text}"`, cwd);
    translate.detect(text, (err, result) => {
      assert.ifError(err);
      assert.equal(output, `Detected: ${JSON.stringify(result)}`);
      done();
    });
  });

  it(`should list languages`, () => {
    const output = run(`${cmd} list`, cwd);
    assert.notEqual(output.indexOf(`Languages:`), -1);
    assert.notEqual(output.indexOf(`{ code: 'af', name: 'Afrikaans' }`), -1);
  });

  it(`should list languages with a target`, () => {
    const output = run(`${cmd} list es`, cwd);
    assert.notEqual(output.indexOf(`Languages:`), -1);
    assert.notEqual(output.indexOf(`{ code: 'af', name: 'afrikáans' }`), -1);
  });

  it(`should translate text`, (done) => {
    const output = run(`${cmd} translate ${toLang} "${text}"`, cwd);
    translate.translate(text, toLang, (err, translation) => {
      assert.ifError(err);
      assert.notEqual(output.indexOf(`Text: ["${text}"]`), -1);
      assert.notEqual(output.indexOf(`Translation: "${translation}"`), -1);
      done();
    });
  });
});
