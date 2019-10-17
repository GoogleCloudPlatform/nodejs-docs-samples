/**
 * Copyright 2019, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const {assert} = require('chai');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

const PROJECT_ID = process.env.GCLOUD_PROJECT;
// Use list-build-triggers.js to figure out the ID of the trigger
// you would like to execute.
const TRIGGER_ID =
  process.env.TRIGGER || 'c9033094-51a9-44c5-b3a0-1d882deb4464';

const {CloudBuildClient} = require('@google-cloud/cloudbuild');
const cb = new CloudBuildClient();

describe('Sample Integration Tests', () => {
  it('should run quickstart.js', async () => {
    execSync(
      `node ./samples/quickstart.js ${PROJECT_ID} ${TRIGGER_ID} cloud-build-mvp`,
      {cwd}
    );
    // confirm that a build has just been kicked off.
    const [builds] = await cb.listBuilds({
      projectId: PROJECT_ID,
    });
    const createTime = builds[0].createTime.seconds * 1000;
    const delta = Date.now() - createTime;
    const maxDelta = 20000; // last build was within 20s.
    assert.ok(delta < maxDelta, `delta ${delta} was > ${maxDelta}`);
  });

  it('should run list-build-triggers.js', async () => {
    const stdout = execSync(
      `node ./samples/list-build-triggers.js ${PROJECT_ID} ${TRIGGER_ID} cloud-build-mvp`,
      {cwd}
    );
    assert.include(stdout, 'Push-to-any-branch');
  });
});
