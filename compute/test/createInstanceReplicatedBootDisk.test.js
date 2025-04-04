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
const {describe, it} = require('mocha');
const cp = require('child_process');
const computeLib = require('@google-cloud/compute');
const {getStaleVMInstances, deleteInstance} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const disksClient = new computeLib.DisksClient();

async function createDisk(projectId, zone, diskName) {
  const [response] = await disksClient.insert({
    project: projectId,
    zone,
    diskResource: {
      name: diskName,
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new computeLib.ZoneOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
}

async function deleteDisk(projectId, zone, diskName) {
  const [response] = await disksClient.delete({
    project: projectId,
    zone,
    disk: diskName,
  });
  let operation = response.latestResponse;
  const operationsClient = new computeLib.ZoneOperationsClient();

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
}

async function createDiskSnapshot(projectId, zone, diskName, snapshotName) {
  const [response] = await disksClient.createSnapshot({
    project: projectId,
    zone,
    disk: diskName,
    snapshotResource: {
      name: snapshotName,
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new computeLib.ZoneOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
}

async function deleteDiskSnapshot(projectId, snapshotName) {
  const snapshotsClient = new computeLib.SnapshotsClient();
  const [response] = await snapshotsClient.delete({
    project: projectId,
    snapshot: snapshotName,
  });
  let operation = response.latestResponse;
  const operationsClient = new computeLib.GlobalOperationsClient();

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
}

describe('Create compute instance with replicated boot disk', async () => {
  const vmName = `instance-replicated-disk-${uuid.v4()}`;
  const snapshotName = `snapshot-${uuid.v4()}`;
  const diskName = `snapshot-disk-${uuid.v4()}`;
  const zone1 = 'us-central1-a';
  const zone2 = 'us-central1-b';
  let projectId;
  let diskSnapshotLink;

  it('should create an instance with replicated boot disk', async () => {
    // before
    const instancesClient = new computeLib.InstancesClient();
    projectId = await instancesClient.getProjectId();
    diskSnapshotLink = `projects/${projectId}/global/snapshots/${snapshotName}`;

    await createDisk(projectId, zone1, diskName);
    await createDiskSnapshot(projectId, zone1, diskName, snapshotName);

    const response = execSync(
      `node ./instances/create-start-instance/createInstanceReplicatedBootDisk.js ${zone1} ${zone2} ${vmName} ${diskSnapshotLink}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Instance: ${vmName} with replicated boot disk created.`
      )
    );

    // after Cleanup resources
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
    await deleteDiskSnapshot(projectId, snapshotName);
    await deleteDisk(projectId, zone1, diskName);
  });
});
