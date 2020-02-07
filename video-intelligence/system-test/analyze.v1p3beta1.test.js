// Copyright 2020 Google LLC
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

const cmd = 'node analyze.v1p3beta1.js';
const url = 'gs://cloud-samples-data/video/googlework_short.mp4';
const file = 'resources/googlework_short.mp4';

describe('analyze v1p3beta1 samples', () => {
  it('should detect people in a local file', async () => {
    const output = execSync(`${cmd} video-person ${file}`);
    assert.match(output, /Hair/);
  });

  it('should detect people in a GCS file', async () => {
    const output = execSync(`${cmd} video-person-gcs ${url}`);
    assert.match(output, /Hair/);
  });

  it('should detect faces in a local file', async () => {
    const output = execSync(`${cmd} video-faces ${file}`);
    assert.match(output, /glasses/);
  });

  it('should detect faces in a GCS file', async () => {
    const output = execSync(`${cmd} video-faces-gcs ${url}`);
    assert.match(output, /glasses/);
  });
});
