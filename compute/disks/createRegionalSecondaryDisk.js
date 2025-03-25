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

async function main(
  secondaryDiskName,
  secondaryLocation,
  primaryDiskName,
  primaryLocation
) {
  // [START compute_disk_create_secondary_regional]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a regionDisksClient
  const regionDisksClient = new computeLib.RegionDisksClient();
  // Instantiate a regionOperationsClient
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project for the secondary disk.
  const secondaryProjectId = await regionDisksClient.getProjectId();

  // The region for the secondary disk.
  // secondaryLocation = 'us-central1';

  // The name of the secondary disk.
  // secondaryDiskName = 'secondary-disk-name';

  // The project that contains the primary disk.
  const primaryProjectId = await regionDisksClient.getProjectId();

  // The region for the primary disk.
  // primaryLocation = 'us-central2';

  // The name of the primary disk that the secondary disk receives data from.
  // primaryDiskName = 'primary-disk-name';

  // The disk type. Must be one of `pd-ssd` or `pd-balanced`.
  const diskType = `regions/${secondaryLocation}/diskTypes/pd-balanced`;

  // The size of the secondary disk in gigabytes.
  const diskSizeGb = 10;

  // Create a secondary disk identical to the primary disk.
  async function callCreateComputeRegionalSecondaryDisk() {
    // Create a secondary disk
    const disk = new compute.Disk({
      sizeGb: diskSizeGb,
      name: secondaryDiskName,
      region: secondaryLocation,
      type: diskType,
      replicaZones: [
        `zones/${secondaryLocation}-a`,
        `zones/${secondaryLocation}-b`,
      ],
      asyncPrimaryDisk: new compute.DiskAsyncReplication({
        // Make sure that the primary disk supports asynchronous replication.
        // Only certain persistent disk types, like `pd-balanced` and `pd-ssd`, are eligible.
        disk: `projects/${primaryProjectId}/regions/${primaryLocation}/disks/${primaryDiskName}`,
      }),
    });

    const [response] = await regionDisksClient.insert({
      project: secondaryProjectId,
      diskResource: disk,
      region: secondaryLocation,
    });

    let operation = response.latestResponse;

    // Wait for the create secondary disk operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: secondaryProjectId,
        region: secondaryLocation,
      });
    }

    console.log(`Secondary disk: ${secondaryDiskName} created.`);
  }

  await callCreateComputeRegionalSecondaryDisk();
  // [END compute_disk_create_secondary_regional]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
