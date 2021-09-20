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

describe('CreatePhraseMatcherAllOf', () => {
  let projectId;
  let phraseMatcherName;

  before(async () => {
    projectId = await client.getProjectId();
  });

  after(async () => {
    client.deletePhraseMatcher({
      name: phraseMatcherName,
    });
  });

  it('should create a phrase matcher', async () => {
    const stdout = execSync(`node ./createPhraseMatcherAllOf.js ${projectId}`);
    phraseMatcherName = stdout.slice(8);
    assert.match(
      stdout,
      new RegExp(
        'Created projects/[0-9]+/locations/us-central1/phraseMatchers/[0-9]+'
      )
    );
  });
});
