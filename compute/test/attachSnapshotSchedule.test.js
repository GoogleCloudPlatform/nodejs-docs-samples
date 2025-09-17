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
const computeLib = require('@google-cloud/compute');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const disksClient = new computeLib.DisksClient();

async function createDisk(projectId, zone, diskName) {
  const [response] = await disksClient.insert({
    project: projectId,
    zone,
    diskResource: {
      name: diskName,
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new computeLib.ZoneOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
}

async function deleteDisk(projectId, zone, diskName) {
  const [response] = await disksClient.delete({
    project: projectId,
    zone,
    disk: diskName,
  });
  let operation = response.latestResponse;
  const operationsClient = new computeLib.ZoneOperationsClient();

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
}

describe('Attach snapshot schedule', async () => {
  const snapshotScheduleName = `snapshot-schedule-name-${uuid.v4().split('-')[0]}`;
  const diskName = `disk-name-with-schedule-attached-${uuid.v4().split('-')[0]}`;
  const region = 'us-central1';
  const zone = `${region}-f`;
  let projectId;

  before(async () => {
    projectId = await disksClient.getProjectId();
    await createDisk(projectId, zone, diskName);
    execSync(
      `node ./snapshotSchedule/createSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  after(async () => {
    await deleteDisk(projectId, zone, diskName);
    execSync(
      `node ./snapshotSchedule/deleteSnapshotSchedule.js ${snapshotScheduleName} ${region}`,
      {
        cwd,
      }
    );
  });

  it('should attach snapshot schedule to disk', () => {
    const response = execSync(
      `node ./snapshotSchedule/attachSnapshotSchedule.js ${snapshotScheduleName} ${diskName} ${region} ${zone}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Snapshot schedule: ${snapshotScheduleName} attached to disk: ${diskName}.`
      )
    );
  });
});
