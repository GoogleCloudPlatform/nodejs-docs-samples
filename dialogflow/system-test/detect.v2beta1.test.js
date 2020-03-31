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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const {execSync} = require('child_process');

const cmd = 'node detect.v2beta1.js';
const testQuery = 'Where is my data stored?';

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('v2beta1 detection', () => {
  it('should detect intent with a knowledge base', () => {
    const output = exec(
      `${cmd} detectIntentKnowledge -q "${testQuery}" -n "OTAxMTY2MTA3MjkyNjUwNzAwOA"`
    );
    assert.include(output, 'Detected Intent:');
  });

  it('should detect Intent with Text to Speech Response', () => {
    const output = exec(
      `${cmd} detectIntentwithTexttoSpeechResponse -q "${testQuery}"`
    );
    assert.include(
      output,
      'Audio content written to file: ./resources/output.wav'
    );
  });

  it('should detect sentiment with intent', () => {
    const output = exec(`${cmd} detectIntentandSentiment -q "${testQuery}"`);
    assert.include(output, 'Detected sentiment');
  });
});
