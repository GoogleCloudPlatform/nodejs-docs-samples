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

async function main(primaryDiskName, primaryLocation) {
  // [START compute_disk_stop_replication]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // Instantiate a diskClient
  const disksClient = new computeLib.DisksClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project that contains the primary disk.
  const primaryProjectId = await disksClient.getProjectId();

  // The zone of the primary disk.
  // primaryLocation = 'us-central1-a';

  // The name of the primary disk.
  // primaryDiskName = 'primary-disk-name';

  // Stop replication
  async function callStopReplication() {
    const [response] = await disksClient.stopAsyncReplication({
      project: primaryProjectId,
      zone: primaryLocation,
      disk: primaryDiskName,
    });

    let operation = response.latestResponse;

    // Wait for the operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: primaryProjectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Replication for primary disk: ${primaryDiskName} stopped.`);
  }

  await callStopReplication();
  // [END compute_disk_stop_replication]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
