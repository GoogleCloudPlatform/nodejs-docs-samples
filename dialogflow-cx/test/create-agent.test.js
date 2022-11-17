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
const uuid = require('uuid');
const execSync = require('child_process').execSync;
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('create agent', () => {
  const cmd = 'node create-agent.js';
  const agentId = `temp_agent_${uuid.v4().split('-')[0]}`;
  const projectId = process.env.GCLOUD_PROJECT;

  it('should create agent', async () => {
    const output = exec(`${cmd} ${projectId} ${agentId}`);
    assert.include(output, agentId);
  });
});
