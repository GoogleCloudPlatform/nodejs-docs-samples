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
const createSharedReservation = require('../reservations/createSharedReservation.js');

describe('Create compute shared reservation using global instance template', async () => {
  const reservationName = 'reservation-01';
  let reservationsClientMock;
  let zoneOperationsClientMock;

  beforeEach(() => {
    sinon.stub(console, 'log');
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

  it('should create shared reservation', async () => {
    await createSharedReservation(
      reservationsClientMock,
      zoneOperationsClientMock
    );

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith(`Reservation: ${reservationName} created.`))
      .to.be.true;
  });
});
