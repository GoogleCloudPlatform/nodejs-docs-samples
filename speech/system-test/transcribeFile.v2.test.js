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
const uuid = require('uuid')
const speech = require('@google-cloud/speech').v2;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');
const text = 'How old is the Brooklyn Bridge';
const projectId = process.env.GCLOUD_PROJECT;

let recognizerName;

describe('Transcribing a local file (v2)', () => {
  before(async ()=>{
    const client = new speech.SpeechClient();
    const recognizerRequest = {
      parent: `projects/${projectId}/locations/global`,
      recognizerId: `rec-${uuid.v4()}`,
      recognizer: {
        languageCodes: ['en-US'],
        model: 'latest_long',
      },
    };

    const operation = await client.createRecognizer(recognizerRequest);
    const recognizer = operation[0].result;
    recognizerName - recognizer.name;
  })
  
  it('should transcribe a local file', async () => {
    const stdout = execSync(`node transcribeFile.v2.js ${recognizerName}`, {cwd});
    assert.match(stdout, new RegExp(`Transcript: ${text}`));
  });

  after(async ()=>{
    const client = new speech.SpeechClient();
    await client.deleteRecognizer({
      name: recognizerName
    })
  });
});