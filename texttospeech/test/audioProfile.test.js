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

const fs = require('fs');
const {assert} = require('chai');
const {describe, it, after} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node audioProfile.js';
const text =
  '"Hello Everybody!  This is an Audio Profile Optimized Sound Byte."';
const outputFile = 'phonetest.mp3';

describe('audio profile', () => {
  after(() => {
    function unlink(outputFile) {
      try {
        fs.unlinkSync(outputFile);
      } catch (err) {
        // Ignore error
      }
    }
    [outputFile].map(unlink);
  });

  it('should synthesize human audio using hardware profile', async () => {
    assert.strictEqual(fs.existsSync(outputFile), false);
    const output = execSync(`${cmd} ${text} ${outputFile}`);
    assert.match(output, new RegExp('Audio content written to file:'));
    assert.ok(fs.existsSync(outputFile));
  });
});
