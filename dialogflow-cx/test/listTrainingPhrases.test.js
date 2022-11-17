// Copyright 2021 Google LLC
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

'use strict';

const {assert} = require('chai');
const {describe, before, it} = require('mocha');
const dialogflow = require('@google-cloud/dialogflow-cx');
const execSync = require('child_process').execSync;
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('list training phrases', () => {
  const location = 'global';
  const agentId = process.env.TRAINING_PHRASE_AGENT_ID;
  const intentId = process.env.TRAINING_PHRASE_INTENT_ID;
  const intentClient = new dialogflow.IntentsClient();
  const cmd = 'node listTrainingPhrases.js';
  let [projectId] = '';

  before('get intent ID', async () => {
    // The path to identify the agent that owns the intent.
    projectId = await intentClient.getProjectId();
  });

  it('should list training phrases in an intent', async () => {
    const output = exec(
      `${cmd} ${projectId} ${intentId} ${location} ${agentId}`
    );
    assert.include(output, 'well thanks');
  });
});
