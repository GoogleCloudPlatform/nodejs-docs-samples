/**
 * Copyright 2017, Google, Inc.
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

const cmd = 'node analyze.js';
const cwd = path.join(__dirname, '..');

const url = 'gs://nodejs-docs-samples-video/quickstart.mp4';
const shortUrl = 'gs://nodejs-docs-samples-video/quickstart_short.mp4';
const file = 'resources/cat.mp4';

// analyze_labels_gcs (one scene)
it('should analyze labels in a GCS file with one scene', async () => {
  const output = await tools.runAsync(`${cmd} labels-gcs ${shortUrl}`, cwd);
  assert.strictEqual(new RegExp(/Label shirt occurs at:/).test(output), true);
  assert.strictEqual(new RegExp(/Confidence: \d+\.\d+/).test(output), true);
});

// analyze_labels_gcs (multiple scenes)
it('should analyze labels in a GCS file with multiple scenes', async () => {
  const output = await tools.runAsync(`${cmd} labels-gcs ${url}`, cwd);
  assert.strictEqual(new RegExp(/Label shirt occurs at:/).test(output), true);
  assert.strictEqual(new RegExp(/Confidence: \d+\.\d+/).test(output), true);
});

// analyze_labels_local
it('should analyze labels in a local file', async () => {
  const output = await tools.runAsync(`${cmd} labels-file ${file}`, cwd);
  assert.strictEqual(
    new RegExp(/Label whiskers occurs at:/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/Confidence: \d+\.\d+/).test(output), true);
});

// analyze_shots (multiple shots)
it('should analyze shots in a GCS file with multiple shots', async () => {
  const output = await tools.runAsync(`${cmd} shots ${url}`, cwd);
  assert.strictEqual(new RegExp(/Scene 0 occurs from:/).test(output), true);
});

// analyze_shots (one shot)
it('should analyze shots in a GCS file with one shot', async () => {
  const output = await tools.runAsync(`${cmd} shots ${shortUrl}`, cwd);
  assert.strictEqual(
    new RegExp(/The entire video is one shot./).test(output),
    true
  );
});

// analyze_safe_search
it('should analyze safe search results in a GCS file', async () => {
  const output = await tools.runAsync(`${cmd} safe-search ${url}`, cwd);
  assert.strictEqual(new RegExp(/Time: \d+\.\d+s/).test(output), true);
  assert.strictEqual(
    new RegExp(/Explicit annotation results:/).test(output),
    true
  );
});

// analyze_video_transcription
it('should analyze video transcription results in a GCS file', async () => {
  const output = await tools.runAsync(`${cmd} transcription ${shortUrl}`, cwd);
  assert.strictEqual(new RegExp(/over the pass/).test(output), true);
});
