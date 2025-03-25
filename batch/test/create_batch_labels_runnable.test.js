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
const assert = require('assert');
const {describe, it} = require('mocha');
const cp = require('child_process');
const {BatchServiceClient} = require('@google-cloud/batch').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create batch labels runnable', async () => {
  const jobName = 'example-job';
  const region = 'us-central1';
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

  it('should create a new job with labels for runnables', async () => {
    const expectedRunnableLabels = [
      {
        executable: 'container',
        labels: {
          RUNNABLE_LABEL_NAME1: 'RUNNABLE_LABEL_VALUE1',
        },
      },
      {
        executable: 'script',
        labels: {
          RUNNABLE_LABEL_NAME2: 'RUNNABLE_LABEL_VALUE2',
        },
      },
    ];

    const response = JSON.parse(
      execSync('node ./create/create_batch_labels_runnable.js', {
        cwd,
      })
    );
    const runnables = response.taskGroups[0].taskSpec.runnables;

    runnables.forEach((runnable, index) => {
      assert.equal(
        runnable.executable,
        expectedRunnableLabels[index].executable
      );
      assert.deepEqual(runnable.labels, expectedRunnableLabels[index].labels);
    });
  });
});
