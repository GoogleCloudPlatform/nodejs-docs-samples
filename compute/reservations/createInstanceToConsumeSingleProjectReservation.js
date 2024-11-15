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

async function main(instanceName, reservationName) {
  // [START compute_consume_single_project_reservation]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a reservationsClient
  const instancesClient = new computeLib.InstancesClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project where you want to create instance.
  const projectId = await instancesClient.getProjectId();
  // The zone in which to create instance.
  const zone = 'us-central1-a';
  // The name of the instance to create.
  // const instanceName = 'instance-01';
  // The name of the reservation to consume.
  // Ensure that the specificReservationRequired field in reservation properties is set to true.
  // const reservationName = 'reservation-01';
  // Machine type to use for VM.
  const machineType = 'n1-standard-4';

  // Create instance to consume a specific single-project reservation
  async function callCreateInstanceToConsumeSingleProjectReservation() {
    // Describe the size and source image of the boot disk to attach to the instance.
    // Ensure that the VM's properties match the reservation's VM properties,
    // including the zone, machine type (machine family, vCPUs, and memory),
    // minimum CPU platform, GPU amount and type, and local SSD interface and size
    const disk = new compute.Disk({
      boot: true,
      autoDelete: true,
      type: 'PERSISTENT',
      initializeParams: {
        diskSizeGb: '10',
        sourceImage: 'projects/debian-cloud/global/images/family/debian-12',
      },
    });

    //  Define networkInterface
    const networkInterface = new compute.NetworkInterface({
      name: 'global/networks/default',
    });

    // Define reservationAffinity
    const reservationAffinity = new compute.ReservationAffinity({
      consumeReservationType: 'SPECIFIC_RESERVATION',
      key: 'compute.googleapis.com/reservation-name',
      values: [reservationName],
    });

    // Create an instance
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

    // Wait for the create instance operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Instance ${instanceName} created.`);
  }

  await callCreateInstanceToConsumeSingleProjectReservation();
  // [END compute_consume_single_project_reservation]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
