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
const path = require('path');
const assert = require('node:assert/strict');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Compute shared reservation', async () => {
  const reservationName = `shared-reservation-e2${Math.floor(Math.random() * 10 + 1)}f`;

  after(() => {
    // Delete reservation
    execSync(`node ./reservations/deleteReservation.js ${reservationName}`, {
      cwd,
    });
  });

  it('should create new shared reservation', async () => {
    const response = JSON.parse(
      execSync(
        `node ./reservations/createSharedReservation.js ${reservationName}`,
        {
          cwd,
        }
      )
    );

    assert.equal(response.name, reservationName);
  });

  it('should update consumer projects in shared reservation', async () => {
    const response = JSON.parse(
      execSync(
        `node ./reservations/sharedReservationConsumerProjectsUpdate.js ${reservationName}`,
        {
          cwd,
        }
      )
    );

    assert.not.equal(response, null);
  });
});
