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
  // [START compute_disk_start_replication]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a diskClient
  const disksClient = new computeLib.DisksClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project of the secondary disk.
  const secondaryProjectId = await disksClient.getProjectId();

  // The zone of the secondary disk.
  // secondaryLocation = 'us-central1-a';

  // The name of the secondary disk.
  // secondaryDiskName = 'secondary-disk-name';

  // The project of the primary disk.
  const primaryProjectId = await disksClient.getProjectId();

  // The zone of the primary disk.
  // primaryLocation = 'us-central1-a';

  // The name of the primary disk.
  // primaryDiskName = 'primary-disk-name';

  // Start replication
  async function callStartReplication() {
    const [response] = await disksClient.startAsyncReplication({
      project: secondaryProjectId,
      zone: primaryLocation,
      disk: primaryDiskName,
      disksStartAsyncReplicationRequestResource:
        new compute.DisksStartAsyncReplicationRequest({
          asyncSecondaryDisk: `projects/${primaryProjectId}/zones/${secondaryLocation}/disks/${secondaryDiskName}`,
        }),
    });

    let operation = response.latestResponse;

    // Wait for the operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: secondaryProjectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(
      `Data replication from primary disk: ${primaryDiskName} to secondary disk: ${secondaryDiskName} started.`
    );
  }

  await callStartReplication();
  // [END compute_disk_start_replication]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
