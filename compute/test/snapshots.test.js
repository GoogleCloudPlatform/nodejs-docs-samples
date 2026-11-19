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

const {after, before, describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const {assert} = require('chai');

const {
  ensureOperationSucceeded,
  deleteDisk: safeDeleteZonalDisk,
  deleteRegionDisk: safeDeleteRegionDisk,
  cleanupStaleResources,
} = require('./util');

const instancesClient = new compute.InstancesClient();
const imagesClient = new compute.ImagesClient();
const disksClient = new compute.DisksClient();
const regionDisksClient = new compute.RegionDisksClient();
const snapshotsClient = new compute.SnapshotsClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const createRegionDisk = async (projectId, region, diskName) => {
  const [response] = await regionDisksClient.insert({
    project: projectId,
    region,
    diskResource: {
      sizeGb: 10,
      name: diskName,
      type: `regions/${region}/diskTypes/pd-balanced`,
      replicaZones: [
        `projects/${projectId}/zones/europe-central2-a`,
        `projects/${projectId}/zones/europe-central2-b`,
      ],
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.RegionOperationsClient();

  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      region: operation.region.split('/').pop(),
    });
  }
  ensureOperationSucceeded(operation);
};

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
  ensureOperationSucceeded(operation);
};

describe('snapshots tests', () => {
  const zonalDiskName = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;
  const zonalSnapshotName = `gcloud-test-snapshot-${uuid.v4().split('-')[0]}`;
  const regionalDiskName = `gcloud-test-disk-${uuid.v4().split('-')[0]}`;
  const regionalSnapshotName = `gcloud-test-snapshot-${uuid.v4().split('-')[0]}`;
  const zone = 'europe-central2-b';
  const location = 'europe-central2';

  before(async () => {
    await cleanupStaleResources();
  });

  after(async () => {
    const projectId = await instancesClient.getProjectId();
    await Promise.all([
      snapshotsClient
        .delete({project: projectId, snapshot: zonalSnapshotName})
        .catch(() => {}),
      snapshotsClient
        .delete({project: projectId, snapshot: regionalSnapshotName})
        .catch(() => {}),
      safeDeleteZonalDisk(zone, zonalDiskName),
      safeDeleteRegionDisk(location, regionalDiskName),
    ]);
  });

  it('should create zonal snapshot and remove', async () => {
    const projectId = await instancesClient.getProjectId();

    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-13',
    });

    await createDisk(projectId, zone, zonalDiskName, newestDebian.selfLink);

    let output = execSync(
      `node snapshots/createSnapshot ${projectId} ${zonalDiskName} ${zonalSnapshotName} ${zone} '' ${location} ''`
    );

    assert.match(output, /Snapshot created./);

    output = execSync(
      `node snapshots/deleteSnapshot ${projectId} ${zonalSnapshotName}`
    );
    assert.match(output, /Snapshot deleted./);

    await safeDeleteZonalDisk(zone, zonalDiskName);
  });

  it('should create regional snapshot and remove', async () => {
    const projectId = await instancesClient.getProjectId();

    await createRegionDisk(projectId, location, regionalDiskName);

    let output = execSync(
      `node snapshots/createSnapshot ${projectId} ${regionalDiskName} ${regionalSnapshotName} '' ${location} ${location} ''`
    );

    assert.match(output, /Snapshot created./);

    output = execSync(
      `node snapshots/deleteSnapshot ${projectId} ${regionalSnapshotName}`
    );
    assert.match(output, /Snapshot deleted./);

    await safeDeleteRegionDisk(location, regionalDiskName);
  });
});
