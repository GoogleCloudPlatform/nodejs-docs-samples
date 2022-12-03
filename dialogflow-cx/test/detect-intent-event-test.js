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
const {describe, it} = require('mocha');
const execSync = require('child_process').execSync;
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('detect intent with EventInput', () => {
  const cmd = 'node detect-intent-event.js';

  const projectId = process.env.GCLOUD_PROJECT;
  const location = 'global';
  const agentId = 'b1808233-450b-4065-9492-bc9b40151641';
  const languageCode = 'en';
  const event = '"No-input Options"';

  it('should return agent response for custom event', async () => {
    const output = exec(
      `${cmd} ${projectId} ${location} ${agentId} ${event} ${languageCode}`
    );
    console.log('OUTPUT', output);
    assert.include(output, "Hi! I'm the Rental Car Virtual Agent");
  });
});
