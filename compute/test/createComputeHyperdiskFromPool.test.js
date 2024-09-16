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
const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const {DisksClient, StoragePoolsClient, ZoneOperationsClient} =
  require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

async function cleanupResources(projectId, zone, diskName, storagePoolName) {
  const disksClient = new DisksClient();
  const storagePoolsClient = new StoragePoolsClient();
  const zoneOperationsClient = new ZoneOperationsClient();
  // Delete disk attached to storagePool
  const [diskResponse] = await disksClient.delete({
    project: projectId,
    disk: diskName,
    zone,
  });

  let diskOperation = diskResponse.latestResponse;

  // Wait for the delete disk operation to complete.
  while (diskOperation.status !== 'DONE') {
    [diskOperation] = await zoneOperationsClient.wait({
      operation: diskOperation.name,
      project: projectId,
      zone: diskOperation.zone.split('/').pop(),
    });
  }

  const [poolResponse] = await storagePoolsClient.delete({
    project: projectId,
    storagePool: storagePoolName,
    zone,
  });
  let poolOperation = poolResponse.latestResponse;

  // Wait for the delete pool operation to complete.
  while (poolOperation.status !== 'DONE') {
    [poolOperation] = await zoneOperationsClient.wait({
      operation: poolOperation.name,
      project: projectId,
      zone: poolOperation.zone.split('/').pop(),
    });
  }
}

describe('Create compute hyperdisk from pool', async () => {
  const diskName = `disk-from-pool-name-745d98${Math.floor(Math.random() * 1000 + 1)}f`;
  const zone = 'us-central1-a';
  const storagePoolName = `storage-pool-name-745d9${Math.floor(Math.random() * 1000 + 1)}5f`;
  const disksClient = new DisksClient();
  let projectId;

  before(async () => {
    projectId = await disksClient.getProjectId();
  });

  after(async () => {
    await cleanupResources(projectId, zone, diskName, storagePoolName);
  });

  it('should create a new storage pool', () => {
    const response = execSync(
      `node ./disks/createComputeHyperdiskPool.js ${storagePoolName}`,
      {
        cwd,
      }
    );

    assert.include(response, `Storage pool: ${storagePoolName} created.`);
  });

  it('should create a new hyperdisk from pool', () => {
    const response = execSync(
      `node ./disks/createComputeHyperdiskFromPool.js ${diskName} ${storagePoolName}`,
      {
        cwd,
      }
    );

    assert.include(response, `Disk: ${diskName} created.`);
  });
});
