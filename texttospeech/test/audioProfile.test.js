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
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node audioProfile.js';
const text = 'Hello Everybody!  This is an Audio Profile Optimized Sound Byte.';
const outputFile1 = 'phonetest.mp3';
const outputFile2 = 'homeTheatreTest.mp3';
const outputFile3 = 'carAudioTest.mp3';
const outputFile4 = 'watchAudioTest.mp3';

describe('audio profile', () => {
  after(() => {
    function unlink(outputFile) {
      try {
        fs.unlinkSync(outputFile);
      } catch (err) {
        // Ignore error
      }
    }
    [outputFile1, outputFile2, outputFile3, outputFile4].map(unlink);
  });

  it('should synthesize Speech for Telephone Audio Profile', async () => {
    assert.strictEqual(fs.existsSync(outputFile1), false);
    const output = execSync(
      `${cmd} synthesize '${text}' -f ${outputFile1} -e telephony-class-application`
    );
    assert.match(
      output,
      new RegExp(`Audio content written to file: ${outputFile1}`)
    );
    assert.ok(fs.existsSync(outputFile1));
  });

  it('should synthesize Speech for Home Theatre Audio Profile', async () => {
    assert.strictEqual(fs.existsSync(outputFile2), false);
    const output = execSync(
      `${cmd} synthesize '${text}' -f ${outputFile2} -e large-home-entertainment-class-device`
    );
    assert.match(
      output,
      new RegExp(`Audio content written to file: ${outputFile2}`)
    );
    assert.ok(fs.existsSync(outputFile2));
  });

  it('should synthesize Speech for Car Audio Audio Profile', async () => {
    assert.strictEqual(fs.existsSync(outputFile3), false);
    const output = execSync(
      `${cmd} synthesize '${text}' -f ${outputFile3} -e large-automotive-class-device`
    );
    assert.match(
      output,
      new RegExp(`Audio content written to file: ${outputFile3}`)
    );
    assert.ok(fs.existsSync(outputFile3));
  });

  it('should synthesize Speech for Watch Audio Profile', async () => {
    assert.strictEqual(fs.existsSync(outputFile4), false);
    const output = execSync(
      `${cmd} synthesize '${text}' -f ${outputFile4} -e wearable-class-device`
    );
    assert.match(
      output,
      new RegExp(`Audio content written to file: ${outputFile4}`)
    );
    assert.ok(fs.existsSync(outputFile4));
  });
});
