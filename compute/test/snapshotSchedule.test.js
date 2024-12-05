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
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Snapshot schedule', async () => {
  const region = 'us-central1';

  it('should create snapshot schedule', () => {
    const snapshotScheduleName = `snapshot-schedule-name-${uuid.v4()}`;

    const response = execSync(
      `node ./snapshotSchedule/createSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Snapshot schedule: ${snapshotScheduleName} created.`)
    );

    // Delete resource
    execSync(
      `node ./snapshotSchedule/deleteSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  it('should return snapshot schedule', () => {
    const snapshotScheduleName = `snapshot-schedule-name-${uuid.v4()}`;
    // Create snapshot
    execSync(
      `node ./snapshotSchedule/createSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./snapshotSchedule/getSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );

    assert(response.includes(snapshotScheduleName));

    // Delete resource
    execSync(
      `node ./snapshotSchedule/deleteSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  it('should edit snapshot schedule', () => {
    const snapshotScheduleName = `snapshot-schedule-name-${uuid.v4()}`;
    // Create snapshot
    execSync(
      `node ./snapshotSchedule/createSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
    const currentSchedule = JSON.parse(
      execSync(
        `node ./snapshotSchedule/getSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
        {
          cwd,
        }
      )
    ).snapshotSchedulePolicy.schedule;

    // Edit snapshot schedule
    execSync(
      `node ./snapshotSchedule/editSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );

    const updatedSchedule = JSON.parse(
      execSync(
        `node ./snapshotSchedule/getSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
        {
          cwd,
        }
      )
    ).snapshotSchedulePolicy.schedule;

    assert.notStrictEqual(currentSchedule, updatedSchedule);

    // Delete resource
    execSync(
      `node ./snapshotSchedule/deleteSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  it('should delete snapshot schedule', () => {
    const snapshotScheduleName = `snapshot-schedule-name-${uuid.v4()}`;
    // Create snapshot
    execSync(
      `node ./snapshotSchedule/createSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./snapshotSchedule/deleteSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Snapshot schedule: ${snapshotScheduleName} deleted.`)
    );
  });
});
