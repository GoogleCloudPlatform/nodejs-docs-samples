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
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const {ReservationsClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create compute reservation by specyfing properties directly', async () => {
  const reservationName = 'reservation-01';
  const zone = 'us-central1-a';
  const reservationsClient = new ReservationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();
  });

  after(async () => {
    await reservationsClient.delete({
      project: projectId,
      reservation: reservationName,
      zone,
    });
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

    const response = JSON.parse(
      execSync('node ./reservations/createReservationFromProperties.js', {
        cwd,
      })
    );

    assert.equal(response.name, reservationName);
    assert.equal(response.specificReservation.count, '3');
    assert.deepEqual(
      response.specificReservation.instanceProperties,
      instanceProperties
    );
  });
});
