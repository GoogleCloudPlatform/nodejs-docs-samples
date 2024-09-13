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

const {beforeEach, afterEach, describe, it} = require('mocha');
const path = require('path');
const assert = require('node:assert/strict');
const cp = require('child_process');
const sinon = require('sinon');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Compute shared reservation', async () => {
  let ReservationsClient, ZoneOperationsClient;
  const reservationName = `shared-reservation-e2e3f${Math.random()}`;
  const projectId = 'project_id';
  const zone = 'us-central1-a';
  const reservation = {
    name: reservationName,
    resourcePolicies: {},
    specificReservationRequired: true,
    specificReservation: {
      count: 3,
      sourceInstanceTemplate: `projects/${projectId}/global/instanceTemplates/global-instance-template-name`,
    },
    shareSettings: {
      shareType: 'SPECIFIC_PROJECTS',
      projectMap: {
        consumerId: {
          projectId: 'consumerId',
        },
      },
    },
  };
  const updatedReservation = {
    ...reservation,
    shareSettings: {
      projectMap: {
        newConsumerId: {
          projectId: 'newConsumerId',
        },
      },
    },
  };
  const operationResponse = {
    latestResponse: {
      status: 'DONE',
      name: 'operation-1234567890',
      zone: {
        value: zone,
      },
    },
  };

  beforeEach(() => {
    ({ReservationsClient, ZoneOperationsClient} =
      require('@google-cloud/compute').v1);

    sinon
      .stub(ReservationsClient.prototype, 'getProjectId')
      .resolves(projectId);
    sinon
      .stub(ReservationsClient.prototype, 'insert')
      .resolves([operationResponse]);
    sinon
      .stub(ReservationsClient.prototype, 'update')
      .resolves([operationResponse]);
    sinon.stub(ZoneOperationsClient.prototype, 'wait').resolves([
      {
        latestResponse: {
          status: 'DONE',
        },
      },
    ]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create new shared reservation', async () => {
    sinon.stub(ReservationsClient.prototype, 'get').resolves([reservation]);

    const response = JSON.parse(
      execSync(
        `node ./reservations/createSharedReservation.js ${reservationName}`,
        {
          cwd,
        }
      )
    );

    assert.deepEqual(response, reservation);
  });

  it('should update consumer projects in shared reservation', async () => {
    sinon
      .stub(ReservationsClient.prototype, 'get')
      .resolves([updatedReservation]);

    const response = JSON.parse(
      execSync(
        `node ./reservations/sharedReservationConsumerProjectsUpdate.js ${reservationName}`,
        {
          cwd,
        }
      )
    );

    assert.deepEqual(response, updatedReservation);
  });
});
