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

async function main() {
  // [START compute_reservation_create_for_regional_instance_template]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a reservationsClient
  const reservationsClient = new computeLib.ReservationsClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // The ID of the project where you want to reserve resources and where the instance template exists.
  const projectId = await reservationsClient.getProjectId();
  // The zone in which to reserve resources.
  const zone = 'us-central1-a';
  // The name of the reservation to create.
  const reservationName = 'reservation-regional-01';
  // The number of VMs to reserve.
  const vmsNumber = 3;
  // The name of an existing instance template.
  const instanceTemplateName =
    'regional-instance-template-for-reservation-name';
  // The location of the instance template.
  // For a regional instance template: regions/REGION. Replace REGION with the region where the instance template is located.
  // If you specify a regional instance template, then you can only reserve VMs within the same region as the template's region.
  const location = `regions/${zone}`;

  async function callCreateComputeReservationGlobalInstanceTemplate() {
    // Create reservation for 3 VMs in zone us-central1-a by specifying a global instance template.
    const specificReservation = new compute.AllocationSpecificSKUReservation({
      count: vmsNumber,
      sourceInstanceTemplate: `projects/${projectId}/${location}/instanceTemplates/${instanceTemplateName}`,
    });

    // Create a reservation.
    const reservation = new compute.Reservation({
      name: reservationName,
      specificReservation,
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

    const createdReservation = (
      await reservationsClient.get({
        project: projectId,
        zone,
        reservation: reservationName,
      })
    )[0];

    console.log(JSON.stringify(createdReservation));
  }

  await callCreateComputeReservationGlobalInstanceTemplate();
  // [END compute_reservation_create_for_regional_instance_template]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
