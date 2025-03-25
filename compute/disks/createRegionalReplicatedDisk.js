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

async function main(diskName, region, zone1, zone2) {
  // [START compute_disk_regional_replicated]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a diskClient
  const disksClient = new computeLib.RegionDisksClient();
  // Instantiate a regionOperationsClient
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project where new disk is created.
  const projectId = await disksClient.getProjectId();

  // The region for the replicated disk to reside in.
  // The disk must be in the same region as the VM that you plan to attach it to.
  // region = 'us-central1';

  // The zones within the region where the two disk replicas are located
  // zone1 = 'us-central1-a';
  // zone2 = 'us-central1-b';

  // The name of the new disk.
  // diskName = 'disk-name';

  // The type of replicated disk.
  // The default value is `pd-standard`. For Hyperdisk, specify the value `hyperdisk-balanced-high-availability`.
  const diskType = `regions/${region}/diskTypes/pd-standard`;

  // The size of the new disk in gigabytes.
  const diskSizeGb = 200;

  // Create a secondary disk identical to the primary disk.
  async function callCreateRegionalDiskReplicated() {
    // Create a replicated disk
    const disk = new compute.Disk({
      sizeGb: diskSizeGb,
      name: diskName,
      region,
      type: diskType,
      replicaZones: [
        `projects/${projectId}/zones/${zone1}`,
        `projects/${projectId}/zones/${zone2}`,
      ],
    });

    const [response] = await disksClient.insert({
      project: projectId,
      diskResource: disk,
      region,
    });

    let operation = response.latestResponse;

    // Wait for the create secondary disk operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }

    console.log(`Regional replicated disk: ${diskName} created.`);
  }

  await callCreateRegionalDiskReplicated();
  // [END compute_disk_regional_replicated]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
