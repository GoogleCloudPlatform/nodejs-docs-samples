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

async function main(instanceName) {
  // [START compute_consume_any_matching_reservation]
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  const instancesClient = new computeLib.InstancesClient();
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Customize the following variables before running the sample.
   */
  // The ID of the project where you want to create instance.
  const projectId = await instancesClient.getProjectId();
  // The zone in which to create instance.
  const zone = 'us-central1-a';
  // The name of the instance to create.
  // const instanceName = 'instance-01';
  // Machine type to use for VM.
  const machineType = 'n1-standard-4';

  async function callCreateInstanceToConsumeAnyReservation() {
    // Describe the size and source image of the boot disk to attach to the instance.
    // Uses a persistent disk so that data is preserved even if the VM is
    // stopped or restarted.
    const disk = new compute.Disk({
      boot: true,
      autoDelete: true,
      type: 'PERSISTENT',
      initializeParams: {
        diskSizeGb: '10',
        sourceImage: 'projects/debian-cloud/global/images/family/debian-12',
      },
    });

    // Use the default network for simplicity. In production environments,
    // you may want to specify a custom network with specific firewall rules
    // and security configurations.
    const networkInterface = new compute.NetworkInterface({
      name: 'global/networks/default',
    });

    // Configure the instance to consume any available reservation that matches
    // its requirements (CPU, memory, etc.). This is a reasonable default for cost
    // optimization for long-running workloads. Consider changing depending on your
    // specific needs or workloads.
    const reservationAffinity = new compute.ReservationAffinity({
      consumeReservationType: 'ANY_RESERVATION',
    });

    // Set the minimum CPU platform to ensure compatibility with
    // machine type and to take advantage of specific CPU features.
    // Change this based on performance and workload needs
    const instance = new compute.Instance({
      name: instanceName,
      machineType: `zones/${zone}/machineTypes/${machineType}`,
      minCpuPlatform: 'Intel Skylake',
      disks: [disk],
      networkInterfaces: [networkInterface],
      reservationAffinity,
    });

    const [response] = await instancesClient.insert({
      project: projectId,
      instanceResource: instance,
      zone,
    });

    let operation = response.latestResponse;

    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Instance ${instanceName} created.`);
  }

  await callCreateInstanceToConsumeAnyReservation();
  // [END compute_consume_any_matching_reservation]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
