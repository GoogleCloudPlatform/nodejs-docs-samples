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
const sinon = require('sinon');
const speech = require('@google-cloud/speech').v2;

const {transcribeFileV2} = require('../transcribeFile.v2')

const text = 'how old is the Brooklyn Bridge';

let recognizerName, projectId;

describe('Transcribing a local file (v2)', () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  before(async () => {
    const client = new speech.SpeechClient();
    projectId = await client.getProjectId();

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
    recognizerName = recognizer.name;
  });
  
  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should transcribe a local file', async () => {
    await transcribeFileV2(recognizerName);
    assert.include(console.log.firstCall.args, `Transcript: ${text}`);
  });

  after(async ()=>{
    const client = new speech.SpeechClient();
    await client.deleteRecognizer({
      name: recognizerName
    })
  });
});