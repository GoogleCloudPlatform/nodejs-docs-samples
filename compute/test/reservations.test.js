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
const assert = require('node:assert/strict');
const {before, describe, it} = require('mocha');
const cp = require('child_process');
const {ReservationsClient} = require('@google-cloud/compute').v1;
const {getStaleReservations, deleteReservation} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Compute reservation', async () => {
  const reservationPrefix = 'reservation';
  const reservationName = `${reservationPrefix}-1a0bb${Math.floor(Math.random() * 1000 + 1)}`;
  const zone = 'us-central1-a';
  const reservationsClient = new ReservationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();
    // Cleanup resorces
    const reservations = await getStaleReservations(reservationPrefix);
    await Promise.all(
      reservations.map(reservation =>
        deleteReservation(reservation.zone, reservation.reservationName)
      )
    );
  });

  it('should create a new reservation', () => {
    const response = execSync(
      `node ./reservations/createReservationFromProperties.js ${reservationName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Reservation: ${reservationName} created.`));
  });

  it('should return reservation', () => {
    const response = JSON.parse(
      execSync(`node ./reservations/getReservation.js ${reservationName}`, {
        cwd,
      })
    );

    assert(response.name === reservationName);
  });

  it('should return list of reservations', () => {
    const response = JSON.parse(
      execSync('node ./reservations/getReservations.js', {
        cwd,
      })
    );

    assert(Array.isArray(response));
  });

  it('should delete reservation', async () => {
    execSync(`node ./reservations/deleteReservation.js ${reservationName}`, {
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
      const expected = `The resource 'projects/${projectId}/zones/${zone}/reservations/${reservationName}' was not found`;
      assert(error.message && error.message.includes(expected));
    }
  });
});
