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
  disksLocation
) {
  // [START compute_consistency_group_disks_list]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // If you want to get regional disks, you should use: RegionDisksClient.
  // Instantiate a disksClient
  const disksClient = new computeLib.DisksClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project that contains the disks.
  const projectId = await disksClient.getProjectId();

  // If you use RegionDisksClient- define region, if DisksClient- define zone.
  // The zone or region of the disks.
  // disksLocation = 'europe-central2-a';

  // The name of the consistency group.
  // consistencyGroupName = 'consistency-group-name';

  // The region of the consistency group.
  // consistencyGroupLocation = 'europe-central2';

  async function callConsistencyGroupDisksList() {
    const filter = `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${consistencyGroupLocation}/resourcePolicies/${consistencyGroupName}`;

    const [response] = await disksClient.list({
      project: projectId,
      // If you use RegionDisksClient, pass region as an argument instead of zone.
      zone: disksLocation,
    });

    // Filtering must be done manually for now, since list filtering inside disksClient.list is not supported yet.
    const filteredDisks = response.filter(disk =>
      disk.resourcePolicies.includes(filter)
    );

    console.log(JSON.stringify(filteredDisks));
  }

  await callConsistencyGroupDisksList();
  // [END compute_consistency_group_disks_list]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
