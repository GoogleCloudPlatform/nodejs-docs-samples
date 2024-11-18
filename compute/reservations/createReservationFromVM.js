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

async function main(reservationName, vmName, zone) {
  // [START compute_reservation_create_from_vm]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a reservationsClient
  const reservationsClient = new computeLib.ReservationsClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();
  // Instantiate a instancesClient
  const instancesClient = new computeLib.InstancesClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project where you want to reserve resources and where the instance template exists.
  const projectId = await reservationsClient.getProjectId();
  // The zone in which to reserve resources.
  zone = 'us-central1-a';
  // The name of the reservation to create.
  // reservationName = 'reservation-02';
  //  The name of the VM which properties you want to use to create the reservation.
  // vmName = 'vm-01';
  // The number of VMs to reserve.
  const vmsNumber = 3;

  async function callCreateComputeReservationFromVM() {
    // Get specified VM
    const [vm] = await instancesClient.get({
      project: projectId,
      zone,
      instance: vmName,
    });

    // Create reservation for 3 VMs in zone us-central1-a by specifying directly the properties from the desired VM
    const specificReservation = new compute.AllocationSpecificSKUReservation({
      count: vmsNumber,
      instanceProperties: {
        machineType: vm.machineType.split('/').pop(),
        minCpuPlatform: vm.minCpuPlatform,
        guestAccelerators: vm.guestAccelerators
          ? [...vm.guestAccelerators]
          : [],
        localSsds: vm.localSsds ? [...vm.localSsds] : [],
      },
    });

    // Create a reservation.
    const reservation = new compute.Reservation({
      name: reservationName,
      zone,
      specificReservation,
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

  await callCreateComputeReservationFromVM();
  // [END compute_reservation_create_from_vm]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
