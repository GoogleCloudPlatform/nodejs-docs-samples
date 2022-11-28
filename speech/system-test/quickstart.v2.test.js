// Copyright 2022 Google LLC
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

/* eslint-disable */

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid').v4;
const speech = require('@google-cloud/speech')

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');
const text = 'how old is the Brooklyn Bridge';
let recognizerName = `recognizer-test${uuid()}`;
const projectId = process.env.GCLOUD_PROJECT;


describe('Quickstart', () => {
  it('should run quickstart', async () => {
    const stdout = execSync(`node quickstart.v2.js ${projectId} ${recognizerName}`, {cwd});
    assert.match(stdout, new RegExp(`Transcript: ${text}`));
  });

  after(()=>{
    const client = new speech.v2.SpeechClient();
    client.deleteRecognizer({
      name: `projects/${projectId}/locations/global/recognizers/${recognizerName}`
    })
  })
});