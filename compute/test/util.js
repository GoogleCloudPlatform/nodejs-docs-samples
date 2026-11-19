/* eslint-disable no-unused-vars */
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

const uuid = require('uuid');
const compute = require('@google-cloud/compute');

const PREFIX = 'gcloud-test-';
const STALE_VM_PREFIXES = [
  PREFIX,
  'vm1-with-replicated-disk-',
  'instance-replicated-disk-',
  'instance-',
];
const STALE_DISK_PREFIXES = [
  PREFIX,
  'snapshot-disk-',
  'primary-disk-',
  'secondary-disk-',
];
const STALE_REGION_DISK_PREFIXES = [
  'replicated-disk-',
  'regional-disk-',
  'gcloud-test-disk-',
];
const STALE_SNAPSHOT_PREFIXES = ['gcloud-test-snapshot-', 'snapshot-'];

const instancesClient = new compute.InstancesClient();
const reservationsClient = new compute.ReservationsClient();
const storagePoolsClient = new compute.StoragePoolsClient();
const disksClient = new compute.DisksClient();
const regionDisksClient = new compute.RegionDisksClient();
const imagesClient = new compute.ImagesClient();
const snapshotsClient = new compute.SnapshotsClient();

// Get a unique ID to use for test resources.
function generateTestId() {
  return `${PREFIX}-${uuid.v4()}`.substr(0, 30);
}

function ensureOperationSucceeded(operation) {
  if (operation && operation.error && operation.error.errors) {
    const details = operation.error.errors
      .map(err => `${err.code}: ${err.message}`)
      .join('; ');
    throw new Error(`Compute operation ${operation.name} failed: ${details}`);
  }
}

function isIgnorableCleanupError(err) {
  const msg = (err && err.message) || '';
  return (
    err?.code === 5 ||
    err?.code === 404 ||
    msg.includes('was not found') ||
    msg.includes('cannot be found') ||
    msg.includes('is already being used') ||
    msg.includes('active asynchronous replication')
  );
}

function matchesPrefix(name, prefix, defaultPrefixes) {
  if (prefix) {
    return name.startsWith(prefix);
  }
  return defaultPrefixes.some(p => name.startsWith(p));
}

/**
 * Get VM instances created more than one hour ago.
 */
async function getStaleVMInstances(prefix) {
  const projectId = await instancesClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = instancesClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [zone, instancesObject] of aggListRequest) {
    if (!zone.startsWith('zones/')) {
      continue;
    }
    const instances = instancesObject.instances || [];
    result.push(
      ...instances
        .filter(
          instance =>
            new Date(instance.creationTimestamp) < currentDate &&
            matchesPrefix(instance.name, prefix, STALE_VM_PREFIXES)
        )
        .map(instance => {
          return {
            zone: zone.split('zones/')[1],
            instanceName: instance.name,
            timestamp: instance.creationTimestamp,
          };
        })
    );
  }

  return result;
}

async function deleteInstance(zone, instanceName) {
  try {
    const projectId = await instancesClient.getProjectId();

    const [response] = await instancesClient.delete({
      project: projectId,
      instance: instanceName,
      zone,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    console.log(`Deleting ${instanceName}`);

    // Wait for the delete operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone,
      });
    }
  } catch (err) {
    if (!isIgnorableCleanupError(err)) {
      throw err;
    }
  }
}

/**
 * Get reservations created more than one hour ago.
 */
async function getStaleReservations(prefix) {
  const projectId = await reservationsClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = reservationsClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [zone, reservationsObject] of aggListRequest) {
    if (!zone.startsWith('zones/')) {
      continue;
    }
    const reservations = reservationsObject.reservations || [];
    result.push(
      ...reservations
        .filter(
          reservation =>
            new Date(reservation.creationTimestamp) < currentDate &&
            reservation.name.startsWith(prefix)
        )
        .map(reservation => {
          return {
            zone: zone.split('zones/')[1],
            reservationName: reservation.name,
            timestamp: reservation.creationTimestamp,
          };
        })
    );
  }

  return result;
}

async function deleteReservation(zone, reservationName) {
  try {
    const projectId = await reservationsClient.getProjectId();

    const [response] = await reservationsClient.delete({
      project: projectId,
      reservation: reservationName,
      zone,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    console.log(`Deleting ${reservationName}`);

    // Wait for the delete operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone,
      });
    }
  } catch (err) {
    if (!isIgnorableCleanupError(err)) {
      throw err;
    }
  }
}

/**
 * Get storage pools created more than one hour ago.
 */
async function getStaleStoragePools(prefix) {
  const projectId = await storagePoolsClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = storagePoolsClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [zone, storagePoolsObject] of aggListRequest) {
    if (!zone.startsWith('zones/')) {
      continue;
    }
    const storagePools = storagePoolsObject.storagePools || [];
    result.push(
      ...storagePools
        .filter(
          storagePool =>
            new Date(storagePool.creationTimestamp) < currentDate &&
            storagePool.name.startsWith(prefix)
        )
        .map(storagePool => {
          return {
            zone: zone.split('zones/')[1],
            storagePoolName: storagePool.name,
            timestamp: storagePool.creationTimestamp,
          };
        })
    );
  }
  return result;
}

async function deleteStoragePool(zone, storagePoolName) {
  try {
    const projectId = await storagePoolsClient.getProjectId();

    const [response] = await storagePoolsClient.delete({
      project: projectId,
      storagePool: storagePoolName,
      zone,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    console.log(`Deleting ${storagePoolName}`);

    // Wait for the delete operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone,
      });
    }
  } catch (err) {
    if (!isIgnorableCleanupError(err)) {
      throw err;
    }
  }
}

/**
 * Get unattached zonal disks created more than one hour ago.
 */
async function getStaleDisks(prefix) {
  const projectId = await disksClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = disksClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [scope, disksObject] of aggListRequest) {
    if (!scope.startsWith('zones/')) {
      continue;
    }
    const disks = disksObject.disks || [];
    result.push(
      ...disks
        .filter(
          disk =>
            (!disk.users || disk.users.length === 0) &&
            new Date(disk.creationTimestamp) < currentDate &&
            matchesPrefix(disk.name, prefix, STALE_DISK_PREFIXES)
        )
        .map(disk => {
          return {
            zone: scope.split('zones/')[1],
            diskName: disk.name,
            timestamp: disk.creationTimestamp,
          };
        })
    );
  }

  return result;
}

async function deleteDisk(zone, diskName) {
  try {
    const projectId = await disksClient.getProjectId();

    const [response] = await disksClient.delete({
      project: projectId,
      disk: diskName,
      zone,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    console.log(`Deleting ${diskName}`);

    // Wait for the delete operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone,
      });
    }
  } catch (err) {
    if (!isIgnorableCleanupError(err)) {
      throw err;
    }
  }
}

/**
 * Get unattached regional disks created more than one hour ago.
 */
async function getStaleRegionDisks(prefix) {
  const projectId = await disksClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = disksClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [scope, disksObject] of aggListRequest) {
    if (!scope.startsWith('regions/')) {
      continue;
    }
    const disks = disksObject.disks || [];
    result.push(
      ...disks
        .filter(
          disk =>
            (!disk.users || disk.users.length === 0) &&
            new Date(disk.creationTimestamp) < currentDate &&
            matchesPrefix(disk.name, prefix, STALE_REGION_DISK_PREFIXES)
        )
        .map(disk => {
          return {
            region: scope.split('regions/')[1],
            diskName: disk.name,
            timestamp: disk.creationTimestamp,
          };
        })
    );
  }

  return result;
}

async function deleteRegionDisk(region, diskName) {
  try {
    const projectId = await regionDisksClient.getProjectId();

    const [response] = await regionDisksClient.delete({
      project: projectId,
      disk: diskName,
      region,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.RegionOperationsClient();

    console.log(`Deleting regional disk ${diskName}`);

    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }
  } catch (err) {
    if (!isIgnorableCleanupError(err)) {
      throw err;
    }
  }
}

/**
 * Best-effort cleanup of leaked VMs, disks, images, and snapshots older than 1h.
 */
async function cleanupStaleResources() {
  try {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );

    const [zonalDisks, regionalDisks] = await Promise.all([
      getStaleDisks(),
      getStaleRegionDisks(),
    ]);

    await Promise.all([
      ...zonalDisks.map(disk => deleteDisk(disk.zone, disk.diskName)),
      ...regionalDisks.map(disk =>
        deleteRegionDisk(disk.region, disk.diskName)
      ),
    ]);

    const projectId = await instancesClient.getProjectId();
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 1);

    for await (const image of imagesClient.listAsync({project: projectId})) {
      if (
        image.name &&
        image.name.startsWith(PREFIX) &&
        new Date(image.creationTimestamp) < currentDate
      ) {
        await imagesClient
          .delete({project: projectId, image: image.name})
          .catch(() => {});
      }
    }

    for await (const snapshot of snapshotsClient.listAsync({
      project: projectId,
    })) {
      if (
        snapshot.name &&
        matchesPrefix(snapshot.name, undefined, STALE_SNAPSHOT_PREFIXES) &&
        new Date(snapshot.creationTimestamp) < currentDate
      ) {
        await snapshotsClient
          .delete({project: projectId, snapshot: snapshot.name})
          .catch(() => {});
      }
    }
  } catch (err) {
    console.warn(`Best-effort stale resource cleanup warning: ${err.message}`);
  }
}

module.exports = {
  generateTestId,
  ensureOperationSucceeded,
  getStaleVMInstances,
  deleteInstance,
  getStaleReservations,
  deleteReservation,
  getStaleStoragePools,
  deleteStoragePool,
  getStaleDisks,
  deleteDisk,
  getStaleRegionDisks,
  deleteRegionDisk,
  cleanupStaleResources,
};
