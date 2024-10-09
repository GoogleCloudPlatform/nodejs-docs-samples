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

async function main(reservationsClient, zoneOperationsClient) {
  // [START compute_reservation_create_shared]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  /**
   * TODO(developer): Uncomment reservationsClient and zoneOperationsClient before running the sample.
   */
  // Instantiate a reservationsClient
  // reservationsClient = new computeLib.ReservationsClient();
  // Instantiate a zoneOperationsClient
  // zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // The ID of the project where you want to reserve resources and where the instance template exists.
  const projectId = await reservationsClient.getProjectId();
  // The zone in which to reserve resources.
  const zone = 'us-central1-a';
  // The name of the reservation to create.
  const reservationName = 'reservation-01';
  // The number of VMs to reserve.
  const vmsNumber = 3;
  // The name of an existing instance template.
  const instanceTemplateName = 'global-instance-template-name';
  // The location of the instance template.
  const location = 'global';

  async function callCreateComputeSharedReservation() {
    // Create reservation for 3 VMs in zone us-central1-a by specifying a instance template.
    const specificReservation = new compute.AllocationSpecificSKUReservation({
      count: vmsNumber,
      sourceInstanceTemplate: `projects/${projectId}/${location}/instanceTemplates/${instanceTemplateName}`,
    });

    // Create share settings. Share reservation with one customer project.
    const shareSettings = new compute.ShareSettings({
      shareType: 'SPECIFIC_PROJECTS',
      projectMap: {
        // The IDs of projects that can consume this reservation. You can include up to 100 consumer projects.
        // These projects must be in the same organization as the owner project.
        // Don't include the owner project. By default, it is already allowed to consume the reservation.
        consumer_project_id: {
          projectId: 'consumer_project_id',
        },
      },
    });

    // Create a reservation.
    const reservation = new compute.Reservation({
      name: reservationName,
      specificReservation,
      specificReservationRequired: true,
      shareSettings,
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
    return response;
  }

  return await callCreateComputeSharedReservation();
  // [END compute_reservation_create_shared]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
