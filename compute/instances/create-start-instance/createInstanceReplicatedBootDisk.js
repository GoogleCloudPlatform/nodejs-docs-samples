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

async function main(zone, remoteZone, instanceName, snapshotLink) {
  // [START compute_instance_create_replicated_boot_disk]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate an instancesClient
  const instancesClient = new computeLib.InstancesClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // Project ID or project number of the Cloud project you want to use.
  const projectId = await instancesClient.getProjectId();

  // The name of the new virtual machine (VM) instance.
  // instanceName = 'vm-name';

  // The link to the snapshot you want to use as the source of your
  // data disk in the form of: "projects/{project_name}/global/snapshots/{boot_snapshot_name}"
  // snapshotLink = 'projects/project_name/global/snapshots/boot_snapshot_name';

  // The name of the zone where you want to create the VM.
  // zone = 'us-central1-a';

  // The remote zone for the replicated disk.
  // remoteZone = 'us-central1-b';

  // Creates a new VM instance with replicated boot disk created from a snapshot.
  async function createInstanceReplicatedBootDisk() {
    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: new compute.Instance({
        name: instanceName,
        disks: [
          new compute.AttachedDisk({
            initializeParams: new compute.AttachedDiskInitializeParams({
              diskSizeGb: '500',
              sourceSnapshot: snapshotLink,
              diskType: `zones/${zone}/diskTypes/pd-standard`,
              replicaZones: [
                `projects/${projectId}/zones/${zone}`,
                `projects/${projectId}/zones/${remoteZone}`,
              ],
            }),
            autoDelete: true,
            boot: true,
            type: 'PERSISTENT',
          }),
        ],
        machineType: `zones/${zone}/machineTypes/n1-standard-1`,
        networkInterfaces: [
          {
            name: 'global/networks/default',
          },
        ],
      }),
    });

    let operation = response.latestResponse;

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Instance: ${instanceName} with replicated boot disk created.`);
  }

  createInstanceReplicatedBootDisk();
  // [END compute_instance_create_replicated_boot_disk]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
