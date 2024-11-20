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
const {after, describe, it} = require('mocha');
const cp = require('child_process');
const computeLib = require('@google-cloud/compute');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

async function deleteDisk(region, diskName) {
  const disksClient = new computeLib.RegionDisksClient();
  const regionOperationsClient = new computeLib.RegionOperationsClient();
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

describe('Create compute regional replicated disk', async () => {
  const diskName = `replicated-disk-${uuid.v4()}`;
  const region = 'europe-central2';
  const zone1 = 'europe-central2-a';
  const zone2 = 'europe-central2-b';

  after(async () => {
    // Cleanup resources
    await deleteDisk(region, diskName);
  });

  it('should create a regional replicated disk', () => {
    const response = execSync(
      `node ./disks/createRegionalReplicatedDisk.js ${diskName} ${region} ${zone1} ${zone2}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Regional replicated disk: ${diskName} created.`));
  });
});
