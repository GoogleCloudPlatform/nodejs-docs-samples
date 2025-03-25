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
  consistencyGroupName,
  consistencyGroupLocation,
  diskName,
  diskLocation
) {
  // [START compute_consistency_group_remove_disk]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // If you want to remove regional disk,
  // you should use: RegionDisksClient and RegionOperationsClient.
  // Instantiate a disksClient
  const disksClient = new computeLib.DisksClient();
  // Instantiate a zone
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project that contains the disk.
  const projectId = await disksClient.getProjectId();

  // The name of the disk.
  // diskName = 'disk-name';

  // If you use RegionDisksClient- define region, if DisksClient- define zone.
  // The zone or region of the disk.
  // diskLocation = 'europe-central2-a';

  // The name of the consistency group.
  // consistencyGroupName = 'consistency-group-name';

  // The region of the consistency group.
  // consistencyGroupLocation = 'europe-central2';

  async function callDeleteDiskFromConsistencyGroup() {
    const [response] = await disksClient.removeResourcePolicies({
      disk: diskName,
      project: projectId,
      // If you use RegionDisksClient, pass region as an argument instead of zone.
      zone: diskLocation,
      disksRemoveResourcePoliciesRequestResource:
        new compute.DisksRemoveResourcePoliciesRequest({
          resourcePolicies: [
            `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${consistencyGroupLocation}/resourcePolicies/${consistencyGroupName}`,
          ],
        }),
    });

    let operation = response.latestResponse;

    // Wait for the delete disk operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        // If you use RegionDisksClient, pass region as an argument instead of zone.
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(
      `Disk: ${diskName} deleted from consistency group: ${consistencyGroupName}.`
    );
  }

  await callDeleteDiskFromConsistencyGroup();
  // [END compute_consistency_group_remove_disk]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
