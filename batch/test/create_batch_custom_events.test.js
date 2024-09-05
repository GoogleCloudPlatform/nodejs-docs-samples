/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('node:assert/strict');
const {describe, it} = require('mocha');
const cwd = path.join(__dirname, '..');
const {BatchServiceClient} = require('@google-cloud/batch').v1;

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Create batch custom events job', async () => {
  const jobName = 'batch-custom-events-job';
  const region = 'europe-central2';
  const batchClient = new BatchServiceClient();
  let projectId;

  before(async () => {
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await batchClient.deleteJob({
      name: `projects/${projectId}/locations/${region}/jobs/${jobName}`,
    });
  });

  it('should create a new job with custom events', () => {
    const response = execSync('node ./create/create_batch_custom_events.js', {
      cwd,
    });
    const runnables = JSON.parse(response).taskGroups[0].taskSpec.runnables;

    assert.equal(runnables[0].displayName, 'script 1');
    assert.equal(runnables[1].displayName, 'barrier 1');
    assert.equal(runnables[2].displayName, 'script 2');
  });
});
