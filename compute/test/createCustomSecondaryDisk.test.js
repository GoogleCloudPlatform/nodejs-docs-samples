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

describe('Create compute custom secondary disk', async () => {
  const prefix = 'custom-disk';
  const secondaryDiskName = `${prefix}-secondary-${uuid.v4()}`;
  const primaryDiskName = `${prefix}-primary-${uuid.v4()}`;
  const secondaryRegion = 'europe-west4';
  const primaryRegion = 'europe-central2';
  const secondaryZone = `${secondaryRegion}-a`;
  const primaryZone = `${primaryRegion}-a`;
  let projectId;

  before(async () => {
    projectId = await disksClient.getProjectId();
    await createDisk(primaryDiskName, primaryZone, projectId);
  });

  after(async () => {
    // Cleanup resources
    const disks = await getStaleDisks(prefix);
    await Promise.all(disks.map(disk => deleteDisk(disk.zone, disk.diskName)));
  });

  it('should create a custom secondary disk', async () => {
    const expectedProperties = {
      guestOsFeatures: [{type: 'FEATURE_TYPE_UNSPECIFIED', _type: 'type'}],
      labels: {
        key: 'value',
      },
    };
    execSync(
      `node ./disks/createCustomSecondaryDisk.js ${secondaryDiskName} ${secondaryZone} ${primaryDiskName} ${primaryZone}`,
      {
        cwd,
      }
    );

    const [disk] = await disksClient.get({
      project: projectId,
      zone: secondaryZone,
      disk: secondaryDiskName,
    });

    assert.deepEqual(disk.guestOsFeatures, expectedProperties.guestOsFeatures);
    assert.deepEqual(disk.labels, expectedProperties.labels);
  });
});
