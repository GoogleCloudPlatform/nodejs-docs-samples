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
const {assert} = require('chai');
const execa = require('execa');

const cmd = 'node analyze.js';
const cwd = path.join(__dirname, '..');
const url = 'gs://nodejs-docs-samples-video/quickstart.mp4';
const shortUrl = 'gs://nodejs-docs-samples-video/quickstart_short.mp4';
const catUrl = 'gs://nodejs-docs-samples/video/cat.mp4';
const file = 'resources/cat.mp4';
const file2 = 'resources/googlework_short.mp4';
const possibleTexts = /Google|GOOGLE|SUR|OMAR|ROTO|Vice President|58oo9|LONDRES|PARIS|METRO|RUE|CARLO/;

const exec = async cmd => (await execa.shell(cmd, {cwd})).stdout;

describe('analyze samples', () => {
  // analyze_labels_gcs (one scene)
  it('should analyze labels in a GCS file with one scene', async () => {
    const output = await exec(`${cmd} labels-gcs ${shortUrl}`);
    assert.match(output, /Label shirt occurs at:/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  // analyze_labels_gcs (multiple scenes)
  it('should analyze labels in a GCS file with multiple scenes', async () => {
    const output = await exec(`${cmd} labels-gcs ${url}`);
    assert.match(output, /Label shirt occurs at:/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  // analyze_labels_local
  it('should analyze labels in a local file', async () => {
    const output = await exec(`${cmd} labels-file ${file}`);
    assert.match(output, /Label whiskers occurs at:/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  // analyze_shots (multiple shots)
  it('should analyze shots in a GCS file with multiple shots', async () => {
    const output = await exec(`${cmd} shots ${url}`);
    assert.match(output, /Scene 0 occurs from:/);
  });

  // analyze_shots (one shot)
  it('should analyze shots in a GCS file with one shot', async () => {
    const output = await exec(`${cmd} shots ${shortUrl}`);
    assert.match(output, /The entire video is one shot./);
  });

  // analyze_safe_search
  it('should analyze safe search results in a GCS file', async () => {
    const output = await exec(`${cmd} safe-search ${url}`);
    assert.match(output, /Time: \d+\.\d+s/);
    assert.match(output, /Explicit annotation results:/);
  });

  // analyze_video_transcription
  it('should analyze video transcription results in a GCS file', async () => {
    const output = await exec(`${cmd} transcription ${shortUrl}`);
    assert.match(output, /over the pass/);
  });

  //detect_text_gcs
  it('should detect text in a GCS file', async () => {
    const output = await exec(`${cmd} video-text-gcs ${shortUrl}`);
    assert.match(output, possibleTexts);
  });

  //detect_text
  it('should detect text in a local file', async () => {
    const output = await exec(`${cmd} video-text ${file2}`);
    assert.match(output, possibleTexts);
  });

  //object_tracking_gcs
  it('should track objects in a GCS file', async () => {
    const output = await exec(`${cmd} track-objects-gcs ${catUrl}`);
    assert.match(output, /cat/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  //object_tracking
  it('should track objects in a local file', async () => {
    const output = await exec(`${cmd} track-objects ${file}`);
    assert.match(output, /cat/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });
});
