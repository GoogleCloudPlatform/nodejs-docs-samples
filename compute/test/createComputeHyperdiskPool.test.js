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
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');
const {StoragePoolsClient} = require('@google-cloud/compute').v1;
const storagePoolsClient = new StoragePoolsClient();

async function deleteStoragePool(projectId, zone, storagePoolName) {
  try {
    await storagePoolsClient.delete({
      project: projectId,
      storagePool: storagePoolName,
      zone,
    });
  } catch (err) {
    console.error('Deleting job failed: ', err);
  }
}

describe('Create compute hyperdisk pool', async () => {
  const storagePoolName = 'storage-pool-name';
  const zone = 'europe-central2-b';
  let projectId;

  before(async () => {
    projectId = await storagePoolsClient.getProjectId();
  });

  after(async () => {
    await deleteStoragePool(projectId, zone, storagePoolName);
  });

  it('should create a new storage pool', () => {
    const response = JSON.parse(
      execSync('node ./disks/createComputeHyperdiskPool.js', {
        cwd,
      })
    );

    assert.equal(response.name, storagePoolName);
  });
});
