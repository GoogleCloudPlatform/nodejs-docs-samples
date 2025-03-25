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
  // [START compute_consistency_group_clone]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // If you want to clone regional disks,
  // you should use: RegionDisksClient and RegionOperationsClient.
  // TODO(developer): Uncomment disksClient and zoneOperationsClient before running the sample.
  // Instantiate a disksClient
  // disksClient = new computeLib.DisksClient();
  // Instantiate a zone
  // zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project that contains the disks.
  const projectId = await disksClient.getProjectId();

  // If you use RegionDisksClient- define region, if DisksClient- define zone.
  // The zone or region that the disks in the consistency group are located in. The clones are created in this location.
  // diskLocation = 'europe-central2-a';
  const disksLocation = 'europe-north1-a';

  // The name of the consistency group, that contains secondary disks to clone.
  // consistencyGroupName = 'consistency-group-name';
  const consistencyGroupName = 'consistency-group-1';

  // The region of the consistency group.
  const consistencyGroupLocation = 'europe-north1';

  async function callConsistencyGroupClone() {
    const [response] = await disksClient.bulkInsert({
      project: projectId,
      // If you use RegionDisksClient, pass region as an argument instead of zone.
      zone: disksLocation,
      bulkInsertDiskResourceResource: new compute.BulkInsertDiskResource({
        sourceConsistencyGroupPolicy: [
          `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${consistencyGroupLocation}/resourcePolicies/${consistencyGroupName}`,
        ],
      }),
    });

    let operation = response.latestResponse;

    // Wait for the clone operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        // If you use RegionDisksClient, pass region as an argument instead of zone.
        zone: operation.zone.split('/').pop(),
      });
    }

    const message = `Disks cloned from consistency group: ${consistencyGroupName}.`;
    console.log(message);
    return message;
  }

  return await callConsistencyGroupClone();
  // [END compute_consistency_group_clone]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
