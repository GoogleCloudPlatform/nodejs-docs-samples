// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
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

const {grantAccessToTableOrView} = require('../grantAccessToTableOrView');
const {setupBeforeAll, cleanupResources} = require('./config');

describe('grantAccessToTableOrView', () => {
  let datasetId = null;
  let entityId = null;
  let tableId = null;
  const projectId = process.env.GCLOUD_PROJECT;

  beforeEach(async () => {
    const response = await setupBeforeAll();
    datasetId = response.datasetId;
    entityId = response.entityId;
    tableId = response.tableId;

    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  afterEach(async () => {
    await cleanupResources(datasetId);
    console.log.restore();
    console.error.restore();
  });

  it('should grant access to a table', async () => {
    const roleId = 'roles/bigquery.dataViewer';
    const principalId = `group:${entityId}`;

    await grantAccessToTableOrView(
      projectId,
      datasetId,
      tableId,
      principalId,
      roleId
    );

    assert.strictEqual(
      console.log.calledWith(
        `Role '${roleId}' granted for principal '${principalId}' on resource '${datasetId}.${tableId}'.`
      ),
      true
    );
  });
});
