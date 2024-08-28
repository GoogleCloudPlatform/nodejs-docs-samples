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
  InstanceTemplatesClient,
  GlobalOperationsClient,
  ZoneOperationsClient,
} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

async function cleanupResources(
  projectId,
  zone,
  reservationName,
  instanceTemplateName
) {
  const reservationsClient = new ReservationsClient();
  const instanceTemplatesClient = new InstanceTemplatesClient();
  const globalOperationsClient = new GlobalOperationsClient();
  const zoneOperationsClient = new ZoneOperationsClient();

  // Delete reservation
  const [reservationResponse] = await reservationsClient.delete({
    project: projectId,
    reservation: reservationName,
    zone,
  });

  let reservationOperation = reservationResponse.latestResponse;

  // Wait for the delete reservation operation to complete.
  while (reservationOperation.status !== 'DONE') {
    [reservationOperation] = await zoneOperationsClient.wait({
      operation: reservationOperation.name,
      project: projectId,
      zone: reservationOperation.zone.split('/').pop(),
    });
  }
  // Delete template
  const [templateResponse] = await instanceTemplatesClient.delete({
    project: projectId,
    instanceTemplate: instanceTemplateName,
  });
  let templateOperation = templateResponse.latestResponse;

  // Wait for the delete template operation to complete.
  while (templateOperation.status !== 'DONE') {
    [templateOperation] = await globalOperationsClient.wait({
      operation: templateOperation.name,
      project: projectId,
    });
  }
}

describe('Create compute reservation using global instance template', async () => {
  const reservationName = 'reservation-global-01';
  const instanceTemplateName = 'global-instance-template-for-reservation-name';
  const zone = 'us-central1-a';
  const reservationsClient = new ReservationsClient();
  let projectId;

  before(async () => {
    projectId = await reservationsClient.getProjectId();

    // Create instance template
    execSync(
      `node ./create-instance-templates/createTemplate.js ${projectId} ${instanceTemplateName}`,
      {
        cwd,
      }
    );
  });

  after(async () => {
    await cleanupResources(
      projectId,
      zone,
      reservationName,
      instanceTemplateName
    );
  });

  it('should create a new reservation', () => {
    const response = JSON.parse(
      execSync(
        'node ./reservations/createReservationGlobalInstanceTemplate.js',
        {
          cwd,
        }
      )
    );

    assert.equal(response.name, reservationName);
    assert.equal(response.specificReservation.count, '3');
    assert.equal(
      response.specificReservation.sourceInstanceTemplate,
      `https://www.googleapis.com/compute/v1/projects/${projectId}/global/instanceTemplates/${instanceTemplateName}`
    );
  });
});
