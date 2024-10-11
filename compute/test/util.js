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

const uuid = require('uuid');
const compute = require('@google-cloud/compute');

const PREFIX = 'gcloud-test-';

const instancesClient = new compute.InstancesClient();

// Get a unique ID to use for test resources.
function generateTestId() {
  return `${PREFIX}-${uuid.v4()}`.substr(0, 30);
}

/**
 * Get VM instances created more than one hour ago.
 */
async function getStaleVMInstances(prefix = PREFIX) {
  const projectId = await instancesClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = instancesClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [zone, instancesObject] of aggListRequest) {
    const instances = instancesObject.instances;
    result.push(
      ...instances
        .filter(
          instance =>
            new Date(instance.creationTimestamp) < currentDate &&
            instance.name.startsWith(prefix)
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
}

const reservationsClient = new compute.ReservationsClient();

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
    const reservations = reservationsObject.reservations;
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
}

const storagePoolsClient = new compute.StoragePoolsClient();

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
    const storagePools = storagePoolsObject.storagePools;
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
}

const disksClient = new compute.DisksClient();

/**
 * Get storage pools created more than one hour ago.
 */
async function getStaleDisks(prefix) {
  const projectId = await disksClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const aggListRequest = disksClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [zone, disksObject] of aggListRequest) {
    const disks = disksObject.disks;
    result.push(
      ...disks
        .filter(
          disk =>
            new Date(disk.creationTimestamp) < currentDate &&
            disk.name.startsWith(prefix)
        )
        .map(disk => {
          return {
            zone: zone.split('zones/')[1],
            diskName: disk.name,
            timestamp: disk.creationTimestamp,
          };
        })
    );
  }

  return result;
}

async function deleteDisk(zone, diskName) {
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
}

module.exports = {
  generateTestId,
  getStaleVMInstances,
  deleteInstance,
  getStaleReservations,
  deleteReservation,
  getStaleStoragePools,
  deleteStoragePool,
  getStaleDisks,
  deleteDisk,
};
