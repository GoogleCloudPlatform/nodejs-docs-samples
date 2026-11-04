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
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Snapshot schedule list', async () => {
  const snapshotScheduleName = `snapshot-list-name-${uuid.v4().split('-')[0]}`;
  const region = 'us-central1';

  before(() => {
    execSync(
      `node ./snapshotSchedule/createSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  after(() => {
    execSync(
      `node ./snapshotSchedule/deleteSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  it('should return list of snapshot schedules', () => {
    const response = JSON.parse(
      execSync(`node ./snapshotSchedule/snapshotScheduleList.js ${region}`, {
        cwd,
      })
    );

    assert(Array.isArray(response));
  });
});
