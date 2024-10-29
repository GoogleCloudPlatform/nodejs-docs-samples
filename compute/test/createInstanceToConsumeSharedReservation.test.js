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
const assert = require('node:assert/strict');
const sinon = require('sinon');
const createInstanceToConsumeSharedReservation = require('../reservations/createInstanceToConsumeSharedReservation.js');

describe('Create instance to consume shared reservation', async () => {
  const instanceName = 'instance-1';
  let instancesClientMock;
  let zoneOperationsClientMock;

  beforeEach(() => {
    instancesClientMock = {
      insert: sinon.stub().resolves([
        {
          name: instanceName,
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

  it('should create instance', async () => {
    const response = await createInstanceToConsumeSharedReservation(
      instancesClientMock,
      zoneOperationsClientMock
    );

    assert(response.name.includes(instanceName));
  });
});
