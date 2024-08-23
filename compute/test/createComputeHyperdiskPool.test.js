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
const {StoragePoolsClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create compute hyperdisk pool', async () => {
  const storagePoolName = 'storage-pool-name';
  const zone = 'us-central1-a';
  const storagePoolsClient = new StoragePoolsClient();
  let projectId;

  before(async () => {
    projectId = await storagePoolsClient.getProjectId();
    try {
      // Ensure resource is deleted attempting to recreate it
      await storagePoolsClient.delete({
        project: projectId,
        storagePool: storagePoolName,
        zone,
      });
    } catch {
      // ok to ignore (resource doesn't exist)
    }
  });

  after(async () => {
    await storagePoolsClient.delete({
      project: projectId,
      storagePool: storagePoolName,
      zone,
    });
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
