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

/* eslint-disable no-dupe-keys */

'use strict';

// [START compute_reservation_consumer_projects_update]

// Import the Compute library
const computeLib = require('@google-cloud/compute');
// Instantiate a reservationsClient
const reservationsClient = new computeLib.ReservationsClient();
// Instantiate a zoneOperationsClient
const zoneOperationsClient = new computeLib.ZoneOperationsClient();

async function main(reservationName) {
  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the owner project, which is the project used to create the shared reservation.
  const projectId = await reservationsClient.getProjectId();
  // The zone where the shared reservation is located.
  // const zone = 'us-central1-a';
  // The name of an existing shared reservation.
  // const reservationName = 'reservation-01';
  // The ID of project to share the reservation with.
  // const consumerId = 'newConsumerId';

  async function callComputeSharedReservationConsumerProjectsUpdate() {
    // Update the reservation.
    const [response] = await reservationsClient.update({
      project: projectId,
      reservation: reservationName,
      /**
       * TODO(developer): Uncomment `paths, zone, reservationResource` variables before running the sample.
       * Define `paths` field for each consumer, that you want to allow/not allow to consume a shared resevation, e.g.
       * to allow 2 projects to consume a shared reservation, you need to specify 2 paths:
       * paths: 'shareSettings.projectMap.{consumerId1}',
       * paths: 'shareSettings.projectMap.{consumerId2}'
       *  */
      // paths: `shareSettings.projectMap.${consumerId}`,
      // zone,
      // reservationResource: {
      //   name: reservationName,
      //   // To stop allowing one or more projects to consume a shared reservation, comment shareSettings object.
      //   shareSettings: {
      //     projectMap: {
      //       newConsumerId: {
      //         projectId: `${consumerId}`,
      //       },
      //     },
      //   },
      // },
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

  await callComputeSharedReservationConsumerProjectsUpdate();
  // [END compute_reservation_consumer_projects_update]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
