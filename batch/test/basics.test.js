// Copyright 2024 Google LLC
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

const assert = require('assert');
const path = require('path');
const cp = require('child_process');
const {describe, it, before} = require('mocha');
const {BatchServiceClient} = require('@google-cloud/batch').v1;

// get a short ID for this test run that only contains characters that are valid in UUID
// (a plain UUID won't do because we want the "test-job-js" prefix and that would exceed the length limit)
const {customAlphabet} = require('nanoid');
const allowedChars = 'qwertyuiopasdfghjklzxcvbnm';
const testRunId = customAlphabet(allowedChars, allowedChars.length)();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

describe('Creates, lists and deletes jobs', () => {
  let batchClient;
  let projectId;

  before(async () => {
    batchClient = new BatchServiceClient();
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await batchClient.close();
  });

  it('creates a job with a script payload', async () => {
    const output = execSync(
      `node create/create_with_script_no_mounting.js ${projectId} us-central1 test-job-js-script-${testRunId}`,
      {cwd}
    );
    assert(output !== null);
  });

  it('gets information about a job', async () => {
    const output = execSync(
      `node get/get_job.js ${projectId} us-central1 test-job-js-script-${testRunId}`,
      {cwd}
    );
    assert(output !== null);
  });

  // TODO: fix test (currently fails, see: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/actions/runs/10329136671/job/28596582003?pr=3787)
  it.skip('lists jobs', async () => {
    const output = execSync(`node list/list_jobs.js ${projectId} us-central1`, {
      cwd,
    });
    console.error(output);
    assert(output !== null);
  });

  it('gets a task', async () => {
    // the server needs a bit of time to create the objects. 10 seconds is way more than enough.
    await new Promise(resolve => setTimeout(resolve, 10000));
    const output = execSync(
      `node get/get_task.js ${projectId} us-central1 test-job-js-script-${testRunId} group0 0`,
      {cwd}
    );
    assert(output !== null);
  });

  it('lists tasks', async () => {
    const output = execSync(
      `node list/list_tasks.js ${projectId} us-central1 test-job-js-script-${testRunId} group0`,
      {cwd}
    );
    assert(output !== null);
  });

  it('deletes the test job', async () => {
    const output = execSync(
      `node delete/delete_job.js ${projectId} us-central1 test-job-js-script-${testRunId}`,
      {cwd}
    );
    assert(output !== null);
  });
});
