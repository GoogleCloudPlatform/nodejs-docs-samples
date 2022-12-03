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
const dialogflow = require('@google-cloud/dialogflow');

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('delete intent', () => {
  const client = new dialogflow.IntentsClient();
  const cmd = 'node resource.js';
  const displayName = `fake_display_name_${uuid.v4().split('-')[0]}`;
  let intentId;

  before('create the intent', async () => {
    const projectId = await client.getProjectId();
    const createIntentRequest = {
      parent: client.projectAgentPath(projectId),
      intent: {
        displayName: displayName,
        trainingPhrases: [
          {
            type: 'EXAMPLE',
            parts: [
              {
                text: 'training_phrase_1',
              },
            ],
          },
        ],
        messages: [
          {
            text: {
              text: ['message1', 'message2'],
            },
          },
        ],
      },
    };

    const responses = await client.createIntent(createIntentRequest);
    intentId = responses[0].name.split('/')[4];
  });

  it('should delete an intent', async () => {
    const output = exec(`${cmd} delete-intent -i ${intentId}`);
    assert.include(output, intentId);
  });
});
