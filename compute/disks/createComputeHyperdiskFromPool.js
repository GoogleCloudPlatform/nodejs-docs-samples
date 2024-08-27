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

async function main() {
  // [START compute_hyperdisk_create_from_pool]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a diskClient
  const disksClient = new computeLib.DisksClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project you want to use.
  const projectId = await disksClient.getProjectId();
  // The zone where your VM and new disk are located.
  const zone = 'europe-central2-b';
  // The name of the new disk
  const diskName = 'disk-from-pool-name';
  // The name of the storage pool
  const storagePoolName = 'storage-pool-name';
  // Link to the storagePool you want to use. Use format:
  // https://www.googleapis.com/compute/v1/projects/{projectId}/zones/{zone}/storagePools/{storagePoolName}
  const storagePool = `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/storagePools/${storagePoolName}`;
  // The type of disk. This value uses the following format:
  // "zones/{zone}/diskTypes/(hyperdisk-balanced|hyperdisk-extreme|hyperdisk-ml|hyperdisk-throughput)".
  // For example: "zones/us-west3-b/diskTypes/hyperdisk-balanced"
  const diskType = `zones/${zone}/diskTypes/hyperdisk-balanced`;
  // Size of the new disk in gigabytes.
  const diskSizeGb = 10;
  // Optional: For Hyperdisk Balanced or Hyperdisk Extreme disks,
  // this is the number of I/O operations per second (IOPS) that the disk can handle.
  const provisionedIops = 3000;
  // Optional: For Hyperdisk Balanced or Hyperdisk Throughput volumes,
  // this is an integer that represents the throughput,
  // measured in MiB per second, that the disk can handle.
  const provisionedThroughput = 140;

  async function callCreateComputeHyperdiskFromPool() {
    // Create a disk
    const disk = new compute.Disk({
      sizeGb: diskSizeGb,
      name: diskName,
      type: diskType,
      zone,
      storagePool,
      provisionedIops,
      provisionedThroughput,
    });

    const [response] = await disksClient.insert({
      project: projectId,
      zone,
      diskResource: disk,
    });

    let operation = response.latestResponse;

    // Wait for the create disk operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    const hyperdisk = (
      await disksClient.get({
        project: projectId,
        zone,
        disk: diskName,
      })
    )[0];

    console.log(JSON.stringify(hyperdisk));
  }

  await callCreateComputeHyperdiskFromPool();
  // [END compute_hyperdisk_create_from_pool]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
