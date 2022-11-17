// Copyright 2016 Google LLC
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

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cmd = 'node recognize.v1p1beta1.js';
const filepath = path.join(__dirname, '..', 'resources', 'audio.raw');

describe('Recognize v1p1beta1', () => {
  it('should run sync recognize with metadata', async () => {
    const output = execSync(`${cmd} ${filepath}`);
    assert.match(output, /how old is the Brooklyn Bridge/);
  });
});
