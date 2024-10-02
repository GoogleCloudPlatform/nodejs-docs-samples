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
const {assert} = require('chai');
const {before, after, describe, it} = require('mocha');
const cp = require('child_process');
const {ReservationsClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Compute reservation', async () => {
  const reservationName = `reservation-1a0bb${Math.floor(Math.random() * 1000 + 1)}`;
  const vmName = `vm-1a0bb${Math.floor(Math.random() * 1000 + 1)}`;
  const zone = 'us-central1-a';
  const machineType = 'e2-small';
  const reservationsClient = new ReservationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();

    // Create VM
    execSync(
      `node ./createInstance.js ${projectId} ${zone} ${vmName} ${machineType}`,
      {
        cwd,
      }
    );
  });

  after(() => {
    //  Delete reservation
    execSync(`node ./reservations/deleteReservation.js ${reservationName}`, {
      cwd,
    });

    //  Delete VM
    execSync(`node ./deleteInstance.js  ${projectId} ${zone} ${vmName}`, {
      cwd,
    });
  });

  it('should create a new reservation from vm', () => {
    const response = execSync(
      `node ./reservations/createReservationFromVM.js ${reservationName} ${vmName} ${zone}`,
      {
        cwd,
      }
    );

    assert.include(response, `Reservation: ${reservationName} created.`);
  });
});
