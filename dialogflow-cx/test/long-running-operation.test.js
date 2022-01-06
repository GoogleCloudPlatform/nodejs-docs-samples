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
const {describe, before, it, after} = require('mocha');
const execSync = require('child_process').execSync;
const uuid = require('uuid');
const dialogflow = require('@google-cloud/dialogflow-cx');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const location = 'global';
let agentId = '';
let agentPath = '';

describe('update intent', async () => {
  const agentClient = new dialogflow.AgentsClient();
  const projectId = await agentClient.getProjectId();
  const agentDisplayName = `temp_agent_${uuid.v4().split('-')[0]}`;
  const parent = 'projects/' + projectId + '/locations/' + location;
  const cmd = 'node long-running-operation.js';

  before('create an agent and get agent id', async () => {
    // The path to identify the agent that owns the intents.

    const agent = {
      displayName: agentDisplayName,
      defaultLanguageCode: 'en',
      timeZone: 'America/Los_Angeles',
    };

    const request = {
      agent,
      parent,
    };

    const [agentResponse] = await agentClient.createAgent(request);

    agentPath = agentResponse.name;
    agentId = agentPath.split('/')[5];
  });

  after('delete Agent', async () => {
    agentClient.deleteAgent({name: agentPath});
  });

  it('should export agent', async () => {
    const output = exec(`${cmd} ${projectId} ${agentId} ${location}`);
    assert.include(output, 'agentContent');
  });
});
