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
const uuid = require('uuid');
const {before, after, describe, it} = require('mocha');
const cp = require('child_process');
const computeLib = require('@google-cloud/compute');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const disksClient = new computeLib.RegionDisksClient();
const regionOperationsClient = new computeLib.RegionOperationsClient();

async function createDisk(diskName, region) {
  const projectId = await disksClient.getProjectId();
  const [response] = await disksClient.insert({
    project: projectId,
    region,
    diskResource: {
      sizeGb: 10,
      name: diskName,
      region,
      type: `regions/${region}/diskTypes/pd-balanced`,
      replicaZones: [`zones/${region}-a`, `zones/${region}-b`],
    },
  });

  let operation = response.latestResponse;

  // Wait for the create disk operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await regionOperationsClient.wait({
      operation: operation.name,
      project: projectId,
      region,
    });
  }

  console.log(`Disk: ${diskName} created.`);
}

async function deleteDisk(region, diskName) {
  const projectId = await disksClient.getProjectId();
  const [response] = await disksClient.delete({
    project: projectId,
    disk: diskName,
    region,
  });
  let operation = response.latestResponse;

  console.log(`Deleting ${diskName}`);

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await regionOperationsClient.wait({
      operation: operation.name,
      project: projectId,
      region,
    });
  }
}

describe('Create compute regional secondary disk', async () => {
  const prefix = 'regional-disk';
  const secondaryDiskName = `${prefix}-secondary-${uuid.v4()}`;
  const primaryDiskName = `${prefix}-primary-${uuid.v4()}`;
  const secondaryRegion = 'europe-west4';
  const primaryRegion = 'europe-central2';
  const disks = [
    {
      diskName: secondaryDiskName,
      region: secondaryRegion,
    },
    {
      diskName: primaryDiskName,
      region: primaryRegion,
    },
  ];

  before(async () => {
    await createDisk(primaryDiskName, primaryRegion);
  });

  after(async () => {
    // Cleanup resources
    await Promise.all(
      disks.map(disk => deleteDisk(disk.region, disk.diskName))
    );
  });

  it('should create a regional secondary disk', () => {
    const response = execSync(
      `node ./disks/createRegionalSecondaryDisk.js ${secondaryDiskName} ${secondaryRegion} ${primaryDiskName} ${primaryRegion}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Secondary disk: ${secondaryDiskName} created.`));
  });
});
