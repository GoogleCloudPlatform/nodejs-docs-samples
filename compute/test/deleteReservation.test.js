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
const path = require('path');
const {before, describe, it} = require('mocha');
const {expect} = require('chai');
const cp = require('child_process');
const {ReservationsClient} = require('@google-cloud/compute').v1;
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Delete compute reservation', async () => {
  const reservationName = 'reservation-01';
  const zone = 'us-central1-a';
  const reservationsClient = new ReservationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();
  });

  it('should delete reservation', async () => {
    // Create reservation
    execSync('node ./reservations/createReservationFromProperties.js', {
      cwd,
    });

    // Delete created reservation
    execSync('node ./reservations/deleteReservation.js', {
      cwd,
    });

    try {
      // Try to get the deleted reservation
      await reservationsClient.get({
        project: projectId,
        zone,
        reservation: reservationName,
      });

      // If the reservation is found, the test should fail
      throw new Error('Reservation was not deleted.');
    } catch (error) {
      // Assert that the error message indicates the reservation wasn't found
      expect(error.message).to.include(
        `The resource 'projects/${projectId}/zones/${zone}/reservations/reservation-01' was not found`
      );
    }
  });
});
