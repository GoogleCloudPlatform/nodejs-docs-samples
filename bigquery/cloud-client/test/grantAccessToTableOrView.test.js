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

const {describe, it, before, after} = require('mocha');
const assert = require('assert');
const {grantAccessToTableOrView} = require('../grantAccessToTableOrView');
const {
  getProjectId,
  getEntityId,
  getDataset,
  getTable,
  setupBeforeAll,
  teardownAfterAll,
} = require('./config');

describe('grantAccessToTableOrView', () => {
  // Setup shared resources before all tests.
  before(async () => {
    await setupBeforeAll();
  });

  // Clean up resources after all tests.
  after(async () => {
    await teardownAfterAll();
  });

  it('should grant access to a table', async () => {
    // Get required test resources.
    const projectId = await getProjectId();
    const dataset = await getDataset();
    const table = await getTable();
    const entityId = getEntityId();

    const ROLE = 'roles/bigquery.dataViewer';
    const PRINCIPAL_ID = `group:${entityId}`;

    // Get the initial empty policy.
    const [emptyPolicy] = await table.getIamPolicy();

    // Initialize bindings array.
    if (!emptyPolicy.bindings) {
      emptyPolicy.bindings = [];
    }

    // In an empty policy the role and principal should not be present.
    assert.strictEqual(
      emptyPolicy.bindings.some(p => p.role === ROLE),
      false,
      'Role should not exist in empty policy'
    );
    assert.strictEqual(
      emptyPolicy.bindings.some(
        p => p.members && p.members.includes(PRINCIPAL_ID)
      ),
      false,
      'Principal should not exist in empty policy'
    );

    // Grant access to the table.
    const updatedPolicy = await grantAccessToTableOrView(
      projectId,
      dataset.id,
      table.id,
      PRINCIPAL_ID,
      ROLE
    );

    // A binding with that role should exist.
    assert.strictEqual(
      updatedPolicy.some(p => p.role === ROLE),
      true,
      'Role should exist after granting access'
    );

    // A binding for that principal should exist.
    assert.strictEqual(
      updatedPolicy.some(p => p.members && p.members.includes(PRINCIPAL_ID)),
      true,
      'Principal should exist after granting access'
    );
  });
});
