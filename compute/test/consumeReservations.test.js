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
const {
  getStaleReservations,
  deleteReservation,
  getStaleVMInstances,
  deleteInstance,
} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Consume reservations', async () => {
  const zone = 'us-central1-a';
  const instancePrefix = 'instance-458a';
  const reservationPrefix = 'reservation-';
  const reservationsClient = new ReservationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();
    // Cleanup resources
    const instances = await getStaleVMInstances(instancePrefix);
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
    const reservations = await getStaleReservations(reservationPrefix);
    await Promise.all(
      reservations.map(reservation =>
        deleteReservation(reservation.zone, reservation.reservationName)
      )
    );
  });

  it('should create instance that consumes any matching reservation', () => {
    const reservationName = `${reservationPrefix}${Math.floor(Math.random() * 1000 + 1)}f8a31896`;
    const instanceName = `${instancePrefix}88aab${Math.floor(Math.random() * 1000 + 1)}f`;

    // Create reservation
    execSync(
      `node ./reservations/createReservationFromProperties.js ${reservationName}`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./reservations/createInstanceToConsumeAnyReservation.js ${instanceName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Instance ${instanceName} created.`));
    // Delete reservation
    execSync(`node ./reservations/deleteReservation.js ${reservationName}`, {
      cwd,
    });
    // Delete instance
    execSync(`node ./deleteInstance.js ${projectId} ${zone} ${instanceName}`, {
      cwd,
    });
  });

  it('should create instance that consumes specific single project reservation', () => {
    const reservationName = `${reservationPrefix}22ab${Math.floor(Math.random() * 1000 + 1)}`;
    const instanceName = `${instancePrefix}${Math.floor(Math.random() * 1000 + 1)}`;

    // Create reservation
    execSync(
      `node ./reservations/createReservationFromProperties.js ${reservationName}`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./reservations/createInstanceToConsumeSingleProjectReservation.js ${instanceName} ${reservationName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Instance ${instanceName} created.`));
    // Delete reservation
    execSync(`node ./reservations/deleteReservation.js ${reservationName}`, {
      cwd,
    });
    // Delete instance
    execSync(`node ./deleteInstance.js ${projectId} ${zone} ${instanceName}`, {
      cwd,
    });
  });

  it('should create instance that should not consume reservations', () => {
    const instanceName = `instance-458a${Math.floor(Math.random() * 1000 + 1)}`;

    const response = execSync(
      `node ./reservations/createInstanceToNotConsumeReservation.js ${instanceName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Instance ${instanceName} created.`));
    // Delete instance
    execSync(`node ./deleteInstance.js ${projectId} ${zone} ${instanceName}`, {
      cwd,
    });
  });

  it('should create template that should not consume reservations', () => {
    const templateName = `template-458a${Math.floor(Math.random() * 1000 + 1)}`;

    const response = execSync(
      `node ./reservations/createTemplateToNotConsumeReservation.js ${templateName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Template ${templateName} created.`));
    // Delete template
    execSync(
      `node ./create-instance-templates/deleteInstanceTemplate.js ${projectId} ${templateName}`,
      {
        cwd,
      }
    );
  });
});
