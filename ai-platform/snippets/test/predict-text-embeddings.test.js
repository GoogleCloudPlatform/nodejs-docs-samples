/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const project = process.env.CAIP_PROJECT_ID;
const dimensionality = 3;
const texts = [
  'banana bread?',
  'banana muffin?',
  'banana?',
  'recipe?',
  'muffin recipe?',
];

describe('predict text embeddings', () => {
  it('should get text embeddings using the latest model', async () => {
    const stdout = execSync(
      `node ./predict-text-embeddings.js ${project} text-embedding-004 '${texts.join(';')}' QUESTION_ANSWERING ${dimensionality}`,
      {cwd}
    );
    const embeddings = JSON.parse(stdout.trimEnd().split('\n').at(-1));
    assert.equal(texts.length, embeddings.length);
    for (const embedding of embeddings) {
      assert.equal(dimensionality, embedding.length);
    }
  });
  it('should get text embeddings using the preview model', async () => {
    const stdout = execSync('node ./predict-text-embeddings-preview.js', {cwd});
    const embeddings = JSON.parse(stdout.trimEnd().split('\n').at(-1));
    assert.equal(3, embeddings.length);
    for (const embedding of embeddings) {
      assert.equal(dimensionality, embedding.length);
    }
  });
});
