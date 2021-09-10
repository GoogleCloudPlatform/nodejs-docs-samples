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
const {before, describe, it} = require('mocha');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const {
  ContactCenterInsightsClient,
} = require('@google-cloud/contact-center-insights');
const client = new ContactCenterInsightsClient();

describe('GetOperation', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });

  it('should get an operation', async () => {
    /**
     * TODO(developer): Replace this variable with your operation name.
     */
    const operationName = `projects/${projectId}/locations/us-central1/operations/12345`;

    try {
      const stdout = execSync(`node ./getOperation.js ${operationName}`);
      assert.match(stdout, new RegExp(`Got operation ${operationName}`));
    } catch (e) {
      if (!e.message.includes('not found')) {
        throw e;
      }
    }
  });
});
