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

async function main(reservationName) {
  // [START compute_reservation_create]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a reservationsClient
  const reservationsClient = new computeLib.ReservationsClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project where you want to reserve resources.
  const projectId = await reservationsClient.getProjectId();
  // The zone in which to reserve resources.
  const zone = 'us-central1-a';
  // The name of the reservation to create.
  // reservationName = 'reservation-01';
  // The number of VMs to reserve.
  const vmsNumber = 3;
  // Machine type to use for each VM.
  const machineType = 'n1-standard-4';

  async function callCreateComputeReservationFromProperties() {
    // Create specific reservation for 3 VMs that each use an N1 predefined machine type with 4 vCPUs.
    const specificReservation = new compute.AllocationSpecificSKUReservation({
      count: vmsNumber,
      instanceProperties: {
        machineType,
        // To have the reserved VMs use a specific minimum CPU platform instead of the zone's default CPU platform.
        minCpuPlatform: 'Intel Skylake',
        // If you want to attach GPUs to your reserved N1 VMs, update and uncomment guestAccelerators if needed.
        // guestAccelerators: [
        //   {
        //     // The number of GPUs to add per reserved VM.
        //     acceleratorCount: 1,
        //     // Supported GPU model for N1 VMs. Ensure that your chosen GPU model is available in the zone,
        //     // where you want to reserve resources.
        //     acceleratorType: 'nvidia-tesla-t4',
        //   },
        // ],
        // If you want to add local SSD disks to each reserved VM, update and uncomment localSsds if needed.
        // You can specify up to 24 Local SSD disks. Each Local SSD disk is 375 GB.
        // localSsds: [
        //   {
        //     diskSizeGb: 375,
        //     // The type of interface you want each Local SSD disk to use. Specify one of the following values: NVME or SCSI.
        //     // Make sure that the machine type you specify for the reserved VMs supports the chosen disk interfaces.
        //     interface: 'NVME',
        //   },
        // ],
      },
    });

    // Create a reservation.
    const reservation = new compute.Reservation({
      name: reservationName,
      zone,
      specificReservation,
      // To specify that only VMs that specifically target this reservation can consume it,
      // set specificReservationRequired field to true.
      specificReservationRequired: true,
    });

    const [response] = await reservationsClient.insert({
      project: projectId,
      reservationResource: reservation,
      zone,
    });

    let operation = response.latestResponse;

    // Wait for the create reservation operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Reservation: ${reservationName} created.`);
  }

  await callCreateComputeReservationFromProperties();
  // [END compute_reservation_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
