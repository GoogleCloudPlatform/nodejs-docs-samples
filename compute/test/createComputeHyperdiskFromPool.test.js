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
const {DisksClient, StoragePoolsClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create compute hyperdisk from pool', async () => {
  const diskName = 'disk-name-from-pool';
  const zone = 'europe-central2-b';
  const storagePoolName = 'storage-pool-name-hyperdisk';
  const disksClient = new DisksClient();
  const storagePoolsClient = new StoragePoolsClient();
  let projectId;

  before(async () => {
    projectId = await disksClient.getProjectId();

    // Ensure resources are deleted before attempting to recreate them
    try {
      await disksClient.delete({
        project: projectId,
        disk: diskName,
        zone,
      });
    } catch (err) {
      // Should be ok to ignore (resource doesn't exist)
      console.error(err);
    }

    try {
      await storagePoolsClient.delete({
        project: projectId,
        storagePool: storagePoolName,
        zone,
      });
    } catch (err) {
      // Should be ok to ignore (resource doesn't exist)
      console.error(err);
    }

    await storagePoolsClient.insert({
      project: projectId,
      storagePoolResource: {
        name: storagePoolName,
        poolProvisionedCapacityGb: 10240,
        poolProvisionedIops: 10000,
        poolProvisionedThroughput: 1024,
        storagePoolType: `projects/${projectId}/zones/${zone}/storagePoolTypes/hyperdisk-balanced`,
        capacityProvisioningType: 'advanced',
        zone,
      },
      zone,
    });
  });

  after(async () => {
    // Trying to delete the disk too quickly seems to fail
    const deleteDisk = async () => {
      setTimeout(async () => {
        await disksClient.delete({
          project: projectId,
          disk: diskName,
          zone,
        });
      }, 120 * 1000); // wait two minutes
    };

    try {
      await deleteDisk();
    } catch {
      // Try one more time after repeating the delay
      await deleteDisk();
    }

    // Need enough time after removing the disk before removing the pool
    const deletePool = async () => {
      setTimeout(async () => {
        await storagePoolsClient.delete({
          project: projectId,
          storagePool: storagePoolName,
          zone,
        });
      }, 120 * 1000); // wait two minutes
    };

    try {
      await deletePool();
    } catch {
      // Try one more time after repeating the delay
      await deletePool();
    }
  });

  it('should create a new hyperdisk from pool', () => {
    const response = JSON.parse(
      execSync('node ./disks/createComputeHyperdiskFromPool.js', {
        cwd,
      })
    );

    assert.equal(response.name, diskName);
    assert.equal(
      response.storagePool,
      `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/storagePools/${storagePoolName}`
    );
  });
});
