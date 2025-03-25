// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const compute = require('@google-cloud/compute');

const {describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const {assert} = require('chai');

const {generateTestId, getStaleVMInstances, deleteInstance} = require('./util');

const instancesClient = new compute.InstancesClient();
const imagesClient = new compute.ImagesClient();
const snapshotsClient = new compute.SnapshotsClient();
const disksClient = new compute.DisksClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const createDisk = async (projectId, zone, diskName, sourceImage) => {
  const [response] = await disksClient.insert({
    project: projectId,
    zone,
    diskResource: {
      sourceImage,
      name: diskName,
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
};

const deleteDisk = async (projectId, zone, diskName) => {
  const [response] = await disksClient.delete({
    project: projectId,
    zone,
    disk: diskName,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
};

const createDiskSnapshot = async (projectId, zone, diskName, snapshotName) => {
  const [response] = await disksClient.createSnapshot({
    project: projectId,
    zone,
    disk: diskName,
    snapshotResource: {
      name: snapshotName,
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
};

const deleteDiskSnapshot = async (projectId, snapshotName) => {
  const [response] = await snapshotsClient.delete({
    project: projectId,
    snapshot: snapshotName,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.GlobalOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
};

describe('create start instance tests', () => {
  const instanceName = generateTestId();
  const networkName = 'global/networks/default-compute';
  const subnetworkName = 'regions/europe-central2/subnetworks/default-compute';
  const diskName = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;
  const snapshotName = `gcloud-test-snapshot-${uuid.v4().split('-')[0]}`;
  const zone = 'europe-central2-b';

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create instance from snapshot', async () => {
    const projectId = await instancesClient.getProjectId();

    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    await createDisk(projectId, zone, diskName, newestDebian.selfLink);
    await createDiskSnapshot(projectId, zone, diskName, snapshotName);

    const diskSnapshotLink = `projects/${projectId}/global/snapshots/${snapshotName}`;

    let output;
    try {
      output = execSync(
        `node instances/create-start-instance/createInstanceFromSnapshot ${projectId} ${zone} ${instanceName} ${diskSnapshotLink}`
      );
    } catch (err) {
      if (err.message.includes('already exists')) {
        return;
      }
      throw err;
    }
    assert.match(output, /Instance created./);
    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);

    await deleteDiskSnapshot(projectId, snapshotName);
    await deleteDisk(projectId, zone, diskName);
  });

  it('should create instance from custom image', async () => {
    const projectId = await instancesClient.getProjectId();

    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    let output;
    try {
      output = execSync(
        `node instances/create-start-instance/createInstanceFromCustomImage ${projectId} ${zone} ${instanceName} ${newestDebian.selfLink}`
      );
    } catch (err) {
      if (err.message.includes('already exists')) {
        return;
      }
      throw err;
    }
    assert.match(output, /Instance created./);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });

  it('should create instance with additional disk', async () => {
    const projectId = await instancesClient.getProjectId();

    let output;
    try {
      output = execSync(
        `node instances/create-start-instance/createInstanceWithAdditionalDisk ${projectId} ${zone} ${instanceName}`
      );
    } catch (err) {
      if (err.message.includes('already exists')) {
        return;
      }
      throw err;
    }
    assert.match(output, /Instance created./);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });

  it('should create instance with subnet', async () => {
    const projectId = await instancesClient.getProjectId();

    let output;
    try {
      output = execSync(
        `node instances/create-start-instance/createInstanceWithSubnet ${projectId} ${zone} ${instanceName} ${networkName} ${subnetworkName}`
      );
    } catch (err) {
      if (err.message.includes('already exists')) {
        return;
      }
      throw err;
    }
    assert.match(output, /Instance created./);
    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });

  it('should create instance with existing disks', async () => {
    const projectId = await instancesClient.getProjectId();

    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    const bootDiskName = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;
    const diskName2 = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;

    await createDisk(projectId, zone, bootDiskName, newestDebian.selfLink);
    await createDisk(projectId, zone, diskName2, newestDebian.selfLink);

    const output = execSync(
      `node instances/create-start-instance/createInstanceWithExistingDisks ${projectId} ${zone} ${instanceName} ${bootDiskName},${diskName2}`
    );
    assert.match(output, /Instance created./);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);

    await deleteDisk(projectId, zone, diskName2);
    await deleteDisk(projectId, zone, bootDiskName);
  });
});
