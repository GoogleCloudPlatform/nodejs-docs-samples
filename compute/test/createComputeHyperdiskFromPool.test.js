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
const {describe, it} = require('mocha');
const cp = require('child_process');
const {DisksClient} = require('@google-cloud/compute').v1;
const {deleteDisk} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create compute hyperdisk from pool', async () => {
  const diskName = 'disk-name';
  const zone = 'europe-central2-b';
  const storagePoolName = 'storage-pool-name';
  const disksClient = new DisksClient();
  let projectId;

  before(async () => {
    projectId = await disksClient.getProjectId();
  });

  after(async () => {
    await deleteDisk(disksClient, projectId, zone, diskName);
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
