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
  // [START compute_reservation_vms_update]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // Instantiate a reservationsClient
  const reservationsClient = new computeLib.ReservationsClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project where the reservation is located.
  const projectId = await reservationsClient.getProjectId();
  // The zone where the reservation is located.
  const zone = 'us-central1-a';
  // The name of an existing reservation.
  // reservationName = 'reservation-01';
  // The new number of VMs to reserve(increase or decrease the number). Before modifying the number of VMs,
  // ensure that all required conditions are met. See: https://cloud.google.com/compute/docs/instances/reservations-modify#resizing_a_reservation.
  const vmsNumber = 1;

  async function callComputeReservationVmsUpdate() {
    // Modify the number of reserved VMs in specific reservation
    const [response] = await reservationsClient.resize({
      project: projectId,
      reservation: reservationName,
      zone,
      reservationsResizeRequestResource: {
        specificSkuCount: vmsNumber,
      },
    });

    let operation = response.latestResponse;

    // Wait for the update reservation operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(`Reservation: ${reservationName} updated.`);
  }

  await callComputeReservationVmsUpdate();
  // [END compute_reservation_vms_update]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
