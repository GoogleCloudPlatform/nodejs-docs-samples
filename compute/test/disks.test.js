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

  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
};

const getInstance = async (projectId, zone, instanceName) => {
  const [instance] = await instancesClient.get({
    project: projectId,
    zone,
    instance: instanceName,
  });

  return instance;
};

const deleteDisk = async (projectId, zone, diskName) => {
  const [response] = await disksClient.delete({
    project: projectId,
    zone,
    disk: diskName,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

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

  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
};

describe('disks tests', () => {
  const instanceName = generateTestId();
  const diskName = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;
  const diskName2 = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;
  const snapshotName = `gcloud-test-snapshot-${uuid.v4().split('-')[0]}`;
  const zone = 'europe-central2-b';
  const diskType = `zones/${zone}/diskTypes/pd-ssd`;

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create disk from snapshot and remove', async () => {
    const projectId = await instancesClient.getProjectId();

    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    await createDisk(projectId, zone, diskName, newestDebian.selfLink);
    await createDiskSnapshot(projectId, zone, diskName, snapshotName);

    const diskSnapshotLink = `projects/${projectId}/global/snapshots/${snapshotName}`;

    let output = execSync(
      `node disks/createDiskFromSnapshot ${projectId} ${zone} ${diskName2} ${diskType} 10 ${diskSnapshotLink}`
    );
    assert.match(output, /Disk created./);

    output = execSync(
      `node disks/deleteDisk ${projectId} ${zone} ${diskName2}`
    );
    assert.match(output, /Disk deleted./);

    await deleteDiskSnapshot(projectId, snapshotName);
    await deleteDisk(projectId, zone, diskName);
  });

  it('should set autodelete field', async () => {
    const projectId = await instancesClient.getProjectId();

    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    const [response] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        disks: [
          {
            initializeParams: {
              diskSizeGb: '10',
              sourceImage: newestDebian.selfLink,
              diskName,
            },
            deviceName: diskName,
            autoDelete: false,
            boot: true,
          },
        ],
        machineType: `zones/${zone}/machineTypes/n1-standard-1`,
        networkInterfaces: [
          {
            name: 'global/networks/default',
          },
        ],
      },
      project: projectId,
      zone,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    const output = execSync(
      `node disks/setDiskAutodelete ${projectId} ${zone} ${instanceName} ${diskName} true`
    );
    assert.match(output, /Disk autoDelete field updated./);

    const instance = await getInstance(projectId, zone, instanceName);

    assert.equal(instance.disks[0].autoDelete, true);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
