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
const {describe, it} = require('mocha');
const {expect} = require('chai');
const cp = require('child_process');
const {ReservationsClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Compute reservation', async () => {
  const reservationName = 'reservation-01';
  const zone = 'us-central1-a';
  const reservationsClient = new ReservationsClient();
  let projectId;
  let reservation;

  before(async () => {
    projectId = await reservationsClient.getProjectId();
  });

  it('should create a new reservation', () => {
    const instanceProperties = {
      _machineType: 'machineType',
      _minCpuPlatform: 'minCpuPlatform',
      guestAccelerators: [
        {
          _acceleratorCount: 'acceleratorCount',
          _acceleratorType: 'acceleratorType',
          acceleratorCount: 1,
          acceleratorType: 'nvidia-tesla-t4',
        },
      ],
      localSsds: [
        {
          diskSizeGb: '375',
          interface: 'NVME',
          _diskSizeGb: 'diskSizeGb',
          _interface: 'interface',
        },
      ],
      machineType: 'n1-standard-4',
      minCpuPlatform: 'Intel Skylake',
    };

    reservation = JSON.parse(
      execSync('node ./reservations/createReservationFromProperties.js', {
        cwd,
      })
    );

    assert.equal(reservation.name, reservationName);
    assert.equal(reservation.specificReservation.count, '3');
    assert.deepEqual(
      reservation.specificReservation.instanceProperties,
      instanceProperties
    );
  });

  it('should return reservation', () => {
    const response = JSON.parse(
      execSync('node ./reservations/getReservation.js', {
        cwd,
      })
    );

    assert.deepEqual(response, reservation);
  });

  it('should return list of reservations', () => {
    const response = JSON.parse(
      execSync('node ./reservations/getReservations.js', {
        cwd,
      })
    );

    assert.deepEqual(response, [reservation]);
  });

  it('should delete reservation', async () => {
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
        `The resource 'projects/${projectId}/zones/${zone}/reservations/${reservationName}' was not found`
      );
    }
  });
});
