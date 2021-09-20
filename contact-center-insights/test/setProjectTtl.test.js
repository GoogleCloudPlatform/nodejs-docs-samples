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
//

'use strict';

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const {
  ContactCenterInsightsClient,
} = require('@google-cloud/contact-center-insights');
const client = new ContactCenterInsightsClient();

describe('SetProjectTtl', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });

  after(async () => {
    // Clears project-level TTL.
    await client.updateSettings({
      settings: {
        name: client.settingsPath(projectId, 'us-central1'),
        conversationTtl: {},
      },
      updateMask: {
        paths: ['conversation_ttl'],
      },
    });
  });

  it('should set a project-level TTL', async () => {
    const stdout = execSync(`node ./setProjectTtl.js ${projectId}`);
    assert.match(
      stdout,
      new RegExp('Set TTL for all incoming conversations to 1 day')
    );
  });
});
