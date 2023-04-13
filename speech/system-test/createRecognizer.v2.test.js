// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable */

'use strict';

const {expect} = require('chai');
const {describe, it} = require('mocha');
const uuid = require('uuid');
const sinon = require('sinon');
const speech = require('@google-cloud/speech').v2;

const {createRecognizerV2} = require('../createRecognizer.v2');

let recognizerId, projectId;

describe('Create a speech recognizer (v2)', () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  }

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  }

  before(async ()=>{
    const client = new speech.SpeechClient();
    projectId = await client.getProjectId();
  })

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should create a speech recognizer', async () => {
    recognizerId = `rec-${uuid.v4()}`;
    await createRecognizerV2(recognizerId, projectId);
    expect(console.log.firstCall.args[0]).to.contain(recognizerId);
  });

  after(async () => {
    const recognizerName = `projects/${projectId}/locations/global/recognizers/${recognizerId}`;
    const client = new speech.SpeechClient();
    await client.deleteRecognizer({
      name: recognizerName
    });
  });
});
