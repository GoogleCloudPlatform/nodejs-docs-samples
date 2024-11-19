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

async function main(disksClient, zoneOperationsClient) {
  // [START compute_consistency_group_stop_replication]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // If disks are regional- use RegionDisksClient and RegionOperationsClient.
  // TODO(developer): Uncomment disksClient and zoneOperationsClient before running the sample.
  // Instantiate a disksClient
  // disksClient = new computeLib.DisksClient();
  // Instantiate a zoneOperationsClient
  // zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project that contains the consistency group.
  const projectId = await disksClient.getProjectId();

  // If you use RegionDisksClient- define region, if DisksClient- define zone.
  // The zone or region of the disks.
  const disksLocation = 'europe-central2-a';

  // The name of the consistency group.
  const consistencyGroupName = 'consistency-group-1';

  // The region of the consistency group.
  const consistencyGroupLocation = 'europe-central2';

  async function callStopReplication() {
    const [response] = await disksClient.stopGroupAsyncReplication({
      project: projectId,
      // If you use RegionDisksClient, pass region as an argument instead of zone.
      zone: disksLocation,
      disksStopGroupAsyncReplicationResourceResource:
        new compute.DisksStopGroupAsyncReplicationResource({
          resourcePolicy: [
            `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${consistencyGroupLocation}/resourcePolicies/${consistencyGroupName}`,
          ],
        }),
    });

    let operation = response.latestResponse;

    // Wait for the operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        // If you use RegionDisksClient, pass region as an argument instead of zone.
        zone: operation.zone.split('/').pop(),
      });
    }

    const message = `Replication stopped for consistency group: ${consistencyGroupName}.`;
    console.log(message);
    return message;
  }

  return await callStopReplication();
  // [END compute_consistency_group_stop_replication]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
