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
  // [START compute_reservation_get]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // Instantiate a reservationsClient
  const reservationsClient = new computeLib.ReservationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project where your reservation is located.
  const projectId = await reservationsClient.getProjectId();
  // The zone where your reservation is located.
  const zone = 'us-central1-a';
  // The name of the reservation to return.
  // reservationName = 'reservation-01';

  async function callGetReservation() {
    const requestedReservation = (
      await reservationsClient.get({
        project: projectId,
        zone,
        reservation: reservationName,
      })
    )[0];

    console.log(JSON.stringify(requestedReservation));
  }

  await callGetReservation();
  // [END compute_reservation_get]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
