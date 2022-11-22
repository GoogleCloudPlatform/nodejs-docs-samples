// Copyright 2019 Google LLC
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

const fs = require('fs');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node ssmlAddresses.js';
const outputFile = 'resources/example.mp3';

describe('ssmlAddresses', () => {
  // delete 'resources/example.mp3' file if it already exists
  before(() => {
    try {
      fs.unlinkSync(outputFile);
    } catch (e) {
      // don't throw an exception
    }
  });

  // delete 'resources/example.mp3' file
  after(() => {
    fs.unlinkSync(outputFile);
    assert.strictEqual(fs.existsSync(outputFile), false);
  });

  it('synthesize speech to local mp3 file', async () => {
    assert.strictEqual(fs.existsSync(outputFile), false);
    const stdout = execSync(`${cmd}`);
    assert.match(
      stdout,
      /Audio content written to file resources\/example.mp3/
    );
    assert.strictEqual(fs.existsSync(outputFile), true);
  });
});
