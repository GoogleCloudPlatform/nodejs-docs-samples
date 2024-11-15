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

async function main(reservationName, location, instanceTemplateName) {
  // [START compute_reservation_create_template]
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
  // The ID of the project where you want to reserve resources and where the instance template exists.
  const projectId = await reservationsClient.getProjectId();
  // The zone in which to reserve resources.
  const zone = 'us-central1-a';
  // The name of the reservation to create.
  // reservationName = 'reservation-01';
  // The number of VMs to reserve.
  const vmsNumber = 3;

  /**
   * The name of an existing instance template.
   * TODO(developer): Uncomment and update instanceTemplateName before running the sample.
   */
  // const instanceTemplateName = 'pernament-region-template-name';

  /**
   * // The location of the instance template.
   * TODO(developer): Uncomment the `location` variable depending on which template you want to use.
   */

  // The location for a regional instance template: regions/{region}. Replace region with the region where the instance template is located.
  // If you specify a regional instance template, then you can only reserve VMs within the same region as the template's region.
  // const location = `regions/${zone.slice(0, -2)}`;

  // The location for a global instance template.
  // const location = 'global';

  async function callCreateComputeReservationInstanceTemplate() {
    // Create reservation for 3 VMs in zone us-central1-a by specifying a instance template.
    const specificReservation = new compute.AllocationSpecificSKUReservation({
      count: vmsNumber,
      sourceInstanceTemplate: `projects/${projectId}/${location}/instanceTemplates/${instanceTemplateName}`,
    });

    // Create a reservation.
    const reservation = new compute.Reservation({
      name: reservationName,
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

  await callCreateComputeReservationInstanceTemplate();
  // [END compute_reservation_create_template]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
