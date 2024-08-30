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
const {
  ReservationsClient,
  RegionInstanceTemplatesClient,
  RegionOperationsClient,
} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create compute reservation using regional instance template', async () => {
  const reservationName = 'reservation-01';
  const instanceTemplateName = 'region-template-name';
  const zone = 'us-central1-a';
  const reservationsClient = new ReservationsClient();
  const instanceTemplatesClient = new RegionInstanceTemplatesClient();
  const regionOperationsClient = new RegionOperationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();
    // Create instance template
    execSync('node ./create-instance-templates/createRegionTemplate.js', {
      cwd,
    });
  });

  after(async () => {
    // Delete reservation
    execSync('node ./reservations/deleteReservation.js', {
      cwd,
    });

    // Delete template
    const [templateResponse] = await instanceTemplatesClient.delete({
      project: projectId,
      instanceTemplate: instanceTemplateName,
      region: zone.slice(0, -2),
    });
    let templateOperation = templateResponse.latestResponse;

    // Wait for the delete template operation to complete.
    while (templateOperation.status !== 'DONE') {
      [templateOperation] = await regionOperationsClient.wait({
        operation: templateOperation.name,
        project: projectId,
        region: zone.slice(0, -2),
      });
    }
  });

  it('should create a new reservation', () => {
    const response = JSON.parse(
      execSync(
        'node ./reservations/createReservationRegionInstanceTemplate.js',
        {
          cwd,
        }
      )
    );

    assert.equal(response.name, reservationName);
    assert.equal(response.specificReservation.count, '3');
    assert.equal(
      response.specificReservation.sourceInstanceTemplate,
      `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${zone.slice(0, -2)}/instanceTemplates/${instanceTemplateName}`
    );
  });
});
