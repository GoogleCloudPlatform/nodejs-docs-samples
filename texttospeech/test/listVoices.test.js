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

'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');

const {describe, it} = require('mocha');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cmd = 'node listVoices.js';

describe('list voices', () => {
  it('should list voices', () => {
    const stdout = execSync(`${cmd} list-voices`);
    assert.match(stdout, /SSML Voice Gender: FEMALE/);
    assert.match(stdout, /Natural Sample Rate Hertz: 24000/);
  });
});
