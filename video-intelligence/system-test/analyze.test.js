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

// https://cloud.google.com/video-intelligence/docs/

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node analyze.js';
const catUrl = 'gs://cloud-samples-data/video/cat.mp4';
const file = 'resources/googlework_short.mp4';
const file2 = 'resources/googlework_short.mp4';
const possibleTexts =
  /Google|GOOGLE|SUR|OMAR|ROTO|Vice President|58oo9|LONDRES|PARIS|METRO|RUE|CARLO/;

describe('analyze samples', () => {
  // analyze_labels_local
  it('should analyze labels in a local file', async () => {
    const output = execSync(`${cmd} labels-file ${file}`);
    assert.match(output, /Label/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  //detect_text
  it('should detect text in a local file', async () => {
    const output = execSync(`${cmd} video-text ${file2}`);
    assert.match(output, possibleTexts);
  });

  //object_tracking_gcs
  it('should track objects in a GCS file', async () => {
    const output = execSync(`${cmd} track-objects-gcs ${catUrl}`);
    assert.match(output, /cat/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  //object_tracking
  it('should track objects in a local file', async () => {
    const output = execSync(`${cmd} track-objects ${file}`);
    assert.match(output, /cat/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });
});
