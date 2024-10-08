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
const {
  getStaleDisks,
  deleteDisk,
  getStaleStoragePools,
  deleteStoragePool,
} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create compute hyperdisk from pool', async () => {
  const diskPrefix = 'disk-from-pool-name-745d98';
  const poolPrefix = 'storage-pool-name-745d9';
  const diskName = `${diskPrefix}${Math.floor(Math.random() * 1000 + 1)}f`;
  const storagePoolName = `${poolPrefix}${Math.floor(Math.random() * 1000 + 1)}5f`;
  const zone = 'us-central1-a';

  before(async () => {
    // Cleanup resources
    const disks = await getStaleDisks(diskPrefix);
    await Promise.all(disks.map(disk => deleteDisk(disk.zone, disk.diskName)));
    const storagePools = await getStaleStoragePools(poolPrefix);
    await Promise.all(
      storagePools.map(pool =>
        deleteStoragePool(pool.zone, pool.storagePoolName)
      )
    );
  });

  after(async () => {
    // Cleanup resources
    await deleteDisk(zone, diskName);
    await deleteStoragePool(zone, storagePoolName);
  });

  it('should create a new storage pool', async () => {
    const response = execSync(
      `node ./disks/createComputeHyperdiskPool.js ${storagePoolName} ${zone}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Storage pool: ${storagePoolName} created.`));
  });

  it('should create a new hyperdisk from pool', async () => {
    const response = execSync(
      `node ./disks/createComputeHyperdiskFromPool.js ${diskName} ${storagePoolName} ${zone}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Disk: ${diskName} created.`));
  });
});
