// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {describe, it, beforeEach, afterEach} = require('mocha');
const assert = require('assert');
const sinon = require('sinon');

const {revokeAccessToTableOrView} = require('../revokeTableOrViewAccess');
const {grantAccessToTableOrView} = require('../grantAccessToTableOrView');
const {setupBeforeAll, cleanupResources} = require('./config');

describe('revokeTableOrViewAccess', () => {
  let datasetId = null;
  let tableId = null;
  let entityId = null;
  const projectId = process.env.GCLOUD_PROJECT;
  const roleId = 'roles/bigquery.dataViewer';

  beforeEach(async () => {
    const response = await setupBeforeAll();
    datasetId = response.datasetId;
    tableId = response.tableId;
    entityId = response.entityId;

    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  afterEach(async () => {
    await cleanupResources(datasetId);
    console.log.restore();
    console.error.restore();
  });

  it('should revoke access to a table for a specific role', async () => {
    const principalId = `group: ${entityId}`;

    // Grant access first
    await grantAccessToTableOrView(
      projectId,
      datasetId,
      tableId,
      principalId,
      roleId
    );

    // Reset console log history
    console.log.resetHistory();

    // Revoke access for the role
    await revokeAccessToTableOrView(
      projectId,
      datasetId,
      tableId,
      roleId,
      null
    );

    // Check that the right message was logged
    assert.strictEqual(
      console.log.calledWith(
        `Role '${roleId}' revoked for all principals on resource '${datasetId}.${tableId}'.`
      ),
      true
    );
  });

  it('should revoke access to a table for a specific principal', async () => {
    const principalId = `group: ${entityId}`;

    // Grant access first
    await grantAccessToTableOrView(
      projectId,
      datasetId,
      tableId,
      principalId,
      roleId
    );

    // Reset console log history
    console.log.resetHistory();

    // Revoke access for the principal
    await revokeAccessToTableOrView(
      projectId,
      datasetId,
      tableId,
      null,
      principalId
    );

    // Check that the right message was logged
    assert.strictEqual(
      console.log.calledWith(
        `Access revoked for principal '${principalId}' on resource '${datasetId}.${tableId}'.`
      ),
      true
    );
  });
});
