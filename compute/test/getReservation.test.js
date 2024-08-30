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

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Get reservation', async () => {
  let insertedReservation;

  before(async () => {
    // Add reservation
    insertedReservation = JSON.parse(
      execSync('node ./reservations/createReservationFromProperties.js', {
        cwd,
      })
    );
  });

  after(async () => {
    // Delete reservation
    execSync('node ./reservations/deleteReservation.js', {
      cwd,
    });
  });

  it('should return requested reservation', () => {
    const response = JSON.parse(
      execSync('node ./reservations/getReservation.js', {
        cwd,
      })
    );

    assert.deepEqual(response, insertedReservation);
  });
});
