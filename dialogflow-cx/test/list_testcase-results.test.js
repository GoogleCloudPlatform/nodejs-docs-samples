// Copyright 2021 Google LLC
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
const execSync = require('child_process').execSync;
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const dialogflow = require('@google-cloud/dialogflow-cx');

describe('Test filtering results', async () => {
  const cmd = 'node list-testcase-results.js';
  const agentId = process.env.AGENT_ID;
  const testId = process.env.TEST_ID;
  const location = 'global';
  const agentClient = new dialogflow.AgentsClient();
  const projectId =
    process.env.AGENT_PROJECT_ID || (await agentClient.getProjectId());

  it('should return filtered test results', async () => {
    const output = exec(`${cmd} ${projectId} ${agentId} ${testId} ${location}`);
    assert.include(output, testId);
  });
});
