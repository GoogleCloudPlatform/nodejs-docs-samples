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

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const execSync = require('child_process').execSync;
const cmd = 'node detect.js';
const cmd_tts = 'node detect-intent-TTS-response.v2.js';
const cmd_sentiment = 'node detect-intent-sentiment.v2.js';
const projectId =
  process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const testQuery = 'Where is my data stored?';

const audioFilepathBookARoom = path
  .join(__dirname, '../resources/book_a_room.wav')
  .replace(/(\s+)/g, '\\$1');

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('basic detection', () => {
  it('should detect text queries', async () => {
    const stdout = exec(`${cmd} text -q "hello"`);
    assert.include(stdout, 'Detected intent');
  });

  it('should detect event query', async () => {
    const stdout = exec(`${cmd} event WELCOME`);
    assert.include(stdout, 'Query: WELCOME');
  });

  it('should detect audio query', async () => {
    const stdout = exec(`${cmd} audio ${audioFilepathBookARoom} -r 16000`);
    assert.include(stdout, 'Detected intent');
  });

  it('should detect audio query in streaming fashion', async () => {
    const stdout = exec(`${cmd} stream ${audioFilepathBookARoom} -r 16000`);
    assert.include(stdout, 'Detected intent');
  });

  it('should detect Intent with Text to Speech Response', async () => {
    const stdout = exec(
      `${cmd_tts} ${projectId} 'SESSION_ID' '${testQuery}' 'en-US' './resources/output.wav'`
    );
    assert.include(
      stdout,
      'Audio content written to file: ./resources/output.wav'
    );
  });

  it('should detect sentiment with intent', async () => {
    const stdout = exec(
      `${cmd_sentiment} ${projectId} 'SESSION_ID' '${testQuery}' 'en-US'`
    );
    assert.include(stdout, 'Detected sentiment');
  });
});
