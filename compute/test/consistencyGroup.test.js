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
const {before, after, describe, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');
const computeLib = require('@google-cloud/compute');
const {getStaleDisks, deleteDisk} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const disksClient = new computeLib.DisksClient();
const zoneOperationsClient = new computeLib.ZoneOperationsClient();

async function createDisk(diskName, zone, projectId) {
  const [response] = await disksClient.insert({
    project: projectId,
    zone,
    diskResource: {
      sizeGb: 10,
      name: diskName,
      zone,
      type: `zones/${zone}/diskTypes/pd-balanced`,
    },
  });

  let operation = response.latestResponse;

  // Wait for the create disk operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await zoneOperationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }

  console.log(`Disk: ${diskName} created.`);
}
describe('Consistency group', async () => {
  const consistencyGroupName = `consistency-group-name-${uuid.v4()}`;
  const prefix = 'disk-name';
  const diskName = `${prefix}-${uuid.v4()}`;
  const diskLocation = 'europe-central2-a';
  const region = 'europe-central2';
  let projectId;

  before(async () => {
    projectId = await disksClient.getProjectId();
    await createDisk(diskName, diskLocation, projectId);
  });

  after(async () => {
    // Cleanup resources
    const disks = await getStaleDisks(prefix);
    await Promise.all(disks.map(disk => deleteDisk(disk.zone, disk.diskName)));
  });

  it('should create a new consistency group', () => {
    const response = execSync(
      `node ./disks/consistencyGroups/createConsistencyGroup.js ${consistencyGroupName} ${region}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Consistency group: ${consistencyGroupName} created.`)
    );
  });

  it('should add disk to consistency group', () => {
    const response = execSync(
      `node ./disks/consistencyGroups/consistencyGroupAddDisk.js ${consistencyGroupName} ${region} ${diskName} ${diskLocation}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Disk: ${diskName} added to consistency group: ${consistencyGroupName}.`
      )
    );
  });

  it('should return disks from consistency group', () => {
    const response = JSON.parse(
      execSync(
        `node ./disks/consistencyGroups/consistencyGroupDisksList.js ${consistencyGroupName} ${region} ${diskLocation}`,
        {
          cwd,
        }
      )
    );

    assert(Array.isArray(response));
  });

  it('should delete disk from consistency group', () => {
    const response = execSync(
      `node ./disks/consistencyGroups/consistencyGroupRemoveDisk.js ${consistencyGroupName} ${region} ${diskName} ${diskLocation}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Disk: ${diskName} deleted from consistency group: ${consistencyGroupName}.`
      )
    );
  });

  it('should delete consistency group', () => {
    const response = execSync(
      `node ./disks/consistencyGroups/deleteConsistencyGroup.js ${consistencyGroupName} ${region}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Consistency group: ${consistencyGroupName} deleted.`)
    );
  });
});
