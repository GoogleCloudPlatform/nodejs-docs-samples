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
const {after, describe, it} = require('mocha');
const execSync = require('child_process').execSync;
const uuid = require('uuid');
const projectId =
  process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const dialogflow = require('@google-cloud/dialogflow');

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('create intent', () => {
  const client = new dialogflow.IntentsClient();
  const cmd = 'node create-intent.js';
  const displayName = `fake_display_name_${uuid.v4().split('-')[0]}`;
  let intentId;

  it('should create an intent', async () => {
    const output = exec(`${cmd} ${projectId} ${displayName}`);
    assert.include(output, 'intents');
    intentId = output.split(' ')[1].split('/')[4];
  });

  after('delete the created intent', async () => {
    const projectId = await client.getProjectId();
    const intentPath = client.projectAgentIntentPath(projectId, intentId);
    const request = {name: intentPath};
    await client.deleteIntent(request);
  });
});
