// Copyright 2020 Google LLC
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
const {describe, before, it} = require('mocha');
const execSync = require('child_process').execSync;
const uuid = require('uuid');
const dialogflow = require('dialogflow');

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('create intent', () => {
  const client = new dialogflow.IntentsClient();
  const cmd = 'node resource.js';
  const displayName = `fake_display_name_${uuid.v4().split('-')[0]}`;
  const phrase1 = 'training_phrase_1';
  const phrase2 = 'training_phrase_2';
  const message1 = 'message_1';
  const message2 = 'message_2';
  let intentId;

  it('should create an intent', async () => {
    const output = exec(
      `${cmd} create-intent -d ${displayName} -t ${phrase1} -t ${phrase2} -m ${message1} -m ${message2}`
    );
    assert.include(output, 'intents');
    intentId = output.split(' ')[1].split('/')[4];
  });

  after('delete the created intent', async () => {
    const projectId = await client.getProjectId();
    const intentPath = client.intentPath(projectId, intentId);
    const request = { name: intentPath };
    const result = await client.deleteIntent(request);
  });
});
