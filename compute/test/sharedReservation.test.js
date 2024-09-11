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
const {expect} = require('chai');
const sinon = require('sinon');
const computeLib = require('@google-cloud/compute');
const createSharedReservation = require('../reservations/createSharedReservation.js');
const sharedReservationConsumerProjectsUpdate = require('../reservations/sharedReservationConsumerProjectsUpdate.js');
const compute = computeLib.protos.google.cloud.compute.v1;

describe('Compute shared reservation', async () => {
  const reservationName = 'reservation-01';
  const projectId = 'project_id';
  const zone = 'us-central1-a';
  const reservation = new compute.Reservation({
    name: reservationName,
    resourcePolicies: {},
    specificReservationRequired: true,
    specificReservation: new compute.AllocationSpecificSKUReservation({
      count: 3,
      sourceInstanceTemplate: `projects/${projectId}/global/instanceTemplates/global-instance-template-name`,
    }),
    shareSettings: new compute.ShareSettings({
      shareType: 'SPECIFIC_PROJECTS',
      projectMap: {
        consumerId: {
          projectId: 'consumerId',
        },
      },
    }),
  });
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
  let reservationsClientMock;
  let zoneOperationsClientMock;
  let insertMock;
  let updateMock;
  let getMock;

  beforeEach(() => {
    sinon.stub(console, 'log');
    insertMock = sinon.stub().resolves([operationResponse]);
    updateMock = sinon.stub().resolves([operationResponse]);
    getMock = sinon.stub();
    reservationsClientMock = {
      getProjectId: sinon.stub().resolves(projectId),
      insert: insertMock,
      update: updateMock,
      get: getMock,
    };
    zoneOperationsClientMock = {
      wait: sinon.stub().resolves([
        {
          latestResponse: {
            status: 'DONE',
          },
        },
      ]),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create and log new shared reservation', async () => {
    getMock.resolves([reservation]);

    await createSharedReservation(
      reservationsClientMock,
      zoneOperationsClientMock
    );

    expect(insertMock.calledOnce).to.be.true;
    expect(
      insertMock.calledWith({
        project: projectId,
        reservationResource: reservation,
        zone,
      })
    ).to.be.true;
    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith(reservation)).to.be.true;
  });

  it('should update consumer projects in shared reservation and log updated reservation', async () => {
    getMock.resolves([updatedReservation]);

    await sharedReservationConsumerProjectsUpdate(
      reservationsClientMock,
      zoneOperationsClientMock
    );

    expect(updateMock.calledOnce).to.be.true;
    expect(
      updateMock.calledWith({
        project: projectId,
        reservation: reservationName,
        paths: 'shareSettings.projectMap.newConsumerId',
        zone,
        reservationResource: {
          name: reservationName,
          shareSettings: updatedReservation.shareSettings,
        },
      })
    ).to.be.true;
    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith(updatedReservation)).to.be.true;
  });
});
