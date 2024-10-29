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

async function main(instancesClient, zoneOperationsClient) {
  // [START compute_consume_specific_shared_reservation]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  /**
   * TODO(developer): Uncomment reservationsClient and zoneOperationsClient before running the sample.
   */
  // Instantiate an instancesClient
  // instancesClient = new computeLib.InstancesClient();
  // Instantiate a zoneOperationsClient
  // zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // The ID of the project where instance will be consumed and created.
  const reservationConsumerProjectId = 'reservation-consumer-project-id';
  // The ID of the project where reservation is created.
  const reservationOwnerProjectId = 'reservation-project-id';
  // The name of the instance to create.
  const instanceName = 'instance-01';
  // The name of the reservation to consume.
  // Ensure that the specificReservationRequired field in reservation properties is set to true.
  const reservationName = 'reservation-1';
  // Machine type to use for VM.
  const machineType = 'n1-standard-1';
  // The zone in which to create instance.
  const zone = 'us-central1-a';

  // Create instance to consume shared reservation
  async function callCreateInstanceToConsumeSharedReservation() {
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
      values: [
        `projects/${reservationOwnerProjectId}/reservations/${reservationName}`,
      ],
    });

    // Create an instance
    const instance = new compute.Instance({
      name: instanceName,
      machineType: `zones/${zone}/machineTypes/${machineType}`,
      disks: [disk],
      networkInterfaces: [networkInterface],
      reservationAffinity,
    });

    const [response] = await instancesClient.insert({
      project: reservationConsumerProjectId,
      instanceResource: instance,
      zone,
    });

    let operation = response.latestResponse;

    // Wait for the create instance operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: reservationConsumerProjectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Instance ${instanceName} created from shared reservation.`);
    return response;
  }

  return await callCreateInstanceToConsumeSharedReservation();
  // [END compute_consume_specific_shared_reservation]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
