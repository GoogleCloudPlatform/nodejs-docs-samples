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

async function main(storagePoolName) {
  // [START compute_hyperdisk_pool_create]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a storagePoolClient
  const storagePoolClient = new computeLib.StoragePoolsClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project you want to use.
  const projectId = await storagePoolClient.getProjectId();
  // Name of the zone in which you want to create the storagePool.
  const zone = 'us-central1-a';
  // Name of the storagePool you want to create.
  // storagePoolName = 'storage-pool-name';
  // The type of disk you want to create. This value uses the following format:
  // "projects/{projectId}/zones/{zone}/storagePoolTypes/(hyperdisk-throughput|hyperdisk-balanced)"
  const storagePoolType = `projects/${projectId}/zones/${zone}/storagePoolTypes/hyperdisk-balanced`;
  // Optional: The capacity provisioning type of the storage pool.
  // The allowed values are advanced and standard. If not specified, the value advanced is used.
  const capacityProvisioningType = 'advanced';
  // The total capacity to provision for the new storage pool, specified in GiB by default.
  const provisionedCapacity = 10240;
  // The IOPS to provision for the storage pool.
  // You can use this flag only with Hyperdisk Balanced Storage Pools.
  const provisionedIops = 10000;
  // The throughput in MBps to provision for the storage pool.
  const provisionedThroughput = 1024;
  // Optional: The performance provisioning type of the storage pool.
  // The allowed values are advanced and standard. If not specified, the value advanced is used.
  const performanceProvisioningType = 'advanced';

  async function callCreateComputeHyperdiskPool() {
    // Create a storagePool.
    const storagePool = new compute.StoragePool({
      name: storagePoolName,
      poolProvisionedCapacityGb: provisionedCapacity,
      poolProvisionedIops: provisionedIops,
      poolProvisionedThroughput: provisionedThroughput,
      storagePoolType,
      performanceProvisioningType,
      capacityProvisioningType,
      zone,
    });

    const [response] = await storagePoolClient.insert({
      project: projectId,
      storagePoolResource: storagePool,
      zone,
    });

    let operation = response.latestResponse;

    // Wait for the create storage pool operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Storage pool: ${storagePoolName} created.`);
  }

  await callCreateComputeHyperdiskPool();
  // [END compute_hyperdisk_pool_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
