// Copyright 2018 Google LLC
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

const cmd = 'node analyze.v1p2beta1.js';
const url = 'gs://cloud-samples-data/video/cat.mp4';
const file1 = 'resources/cat.mp4';
const file2 = 'resources/googlework_short.mp4';
const possibleTexts = /Google|GOOGLE|SUR|OMAR|ROTO|Vice President|58oo9|LONDRES|PARIS|METRO|RUE|CARLO/;

describe('analyze v1p2beta1 samples', () => {
  it('should detect text in a local file', async () => {
    const output = execSync(`${cmd} video-text ${file2}`);
    assert.match(output, possibleTexts);
  });

  it('should track objects in a GCS file', async () => {
    const output = execSync(`${cmd} track-objects-gcs ${url}`);
    assert.match(output, /cat/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });

  it('should track objects in a local file', async () => {
    const output = execSync(`${cmd} track-objects ${file1}`);
    assert.match(output, /cat/);
    assert.match(output, /Confidence: \d+\.\d+/);
  });
});
