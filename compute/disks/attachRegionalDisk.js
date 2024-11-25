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

async function main(diskName, region, vmName, zone) {
  // [START compute_instance_attach_regional_disk]
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
  // Your project ID.
  const projectId = await instancesClient.getProjectId();

  // The zone of your VM.
  // zone = 'us-central1-a';

  // The name of the VM to which you're adding the new replicated disk.
  // vmName = 'vm-name';

  // The name of the replicated disk
  // diskName = 'disk-name';

  // The region where the replicated disk is located.
  // region = 'us-central1';

  async function callAttachRegionalDisk() {
    const [response] = await instancesClient.attachDisk({
      instance: vmName,
      project: projectId,
      attachedDiskResource: new compute.AttachedDisk({
        source: `projects/${projectId}/regions/${region}/disks/${diskName}`,
        // If you want to force the disk to be attached, uncomment next line.
        // forceAttach: true,
      }),
      zone,
    });

    let operation = response.latestResponse;

    // Wait for the operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Replicated disk: ${diskName} attached to VM: ${vmName}.`);
  }

  await callAttachRegionalDisk();
  // [END compute_instance_attach_regional_disk]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
