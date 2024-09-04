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

const {after, describe, it} = require('mocha');
const {expect} = require('chai');
const sinon = require('sinon');
const createSharedReservation = require('../reservations/createSharedReservation.js');

describe('Create compute shared reservation using global instance template', async () => {
  const reservationName = 'reservation-01';
  const reservation = {
    name: reservationName,
    shareSettings: {
      shareType: 'SPECIFIC_PROJECTS',
      projectMap: {
        consumer_project_id: {
          projectId: 'consumer_project_id',
        },
      },
    },
  };
  let reservationsClientMock;
  let zoneOperationsClientMock;

  before(() => {
    reservationsClientMock = {
      getProjectId: sinon.stub().resolves('project_id'),
      insert: sinon.stub().resolves([
        {
          latestResponse: {
            status: 'DONE',
            name: 'operation-1234567890',
            zone: {
              value: 'us-central1-a',
            },
          },
        },
      ]),
      get: sinon.stub().resolves([reservation]),
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

  after(() => {
    sinon.restore();
  });

  it('should create and log new shared reservation', async () => {
    sinon.stub(console, 'log');

    await createSharedReservation(
      reservationsClientMock,
      zoneOperationsClientMock
    );

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith(reservation)).to.be.true;
  });
});
