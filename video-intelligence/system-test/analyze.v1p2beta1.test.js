/**
 * Copyright 2018, Google, LLC
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://cloud.google.com/video-intelligence/docs/

'use strict';

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node analyze.v1p2beta1.js';
const cwd = path.join(__dirname, '..');

const shortUrl = 'gs://nodejs-docs-samples/video/googlework_short.mp4';
const url = 'gs://nodejs-docs-samples/video/cat.mp4';
const file1 = 'resources/cat.mp4';
const file2 = 'resources/googlework_short.mp4';
const possibleTexts = /Google|GOOGLE|SUR|OMAR|ROTO|Vice President|58oo9|LONDRES|PARIS|METRO|RUE|CARLO/;

it('should detect text in a GCS file', async () => {
  const output = await tools.runAsync(`${cmd} video-text-gcs ${shortUrl}`, cwd);
  assert.strictEqual(new RegExp(possibleTexts).test(output), true);
});

it('should detect text in a local file', async () => {
  const output = await tools.runAsync(`${cmd} video-text ${file2}`, cwd);
  assert.strictEqual(new RegExp(possibleTexts).test(output), true);
});

it('should track objects in a GCS file', async () => {
  const output = await tools.runAsync(`${cmd} track-objects-gcs ${url}`, cwd);
  assert.strictEqual(new RegExp(/cat/).test(output), true);
  assert.strictEqual(new RegExp(/Confidence: \d+\.\d+/).test(output), true);
});

it('should track objects in a local file', async () => {
  const output = await tools.runAsync(`${cmd} track-objects ${file1}`, cwd);
  assert.strictEqual(new RegExp(/cat/).test(output), true);
  assert.strictEqual(new RegExp(/Confidence: \d+\.\d+/).test(output), true);
});
