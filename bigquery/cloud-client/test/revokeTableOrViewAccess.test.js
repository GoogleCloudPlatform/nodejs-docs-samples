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

const {assert} = require('chai');
const {describe, before, after, it} = require('mocha');

const {revokeAccessToTableOrView} = require('../revokeTableOrViewAccess');
const {grantAccessToTableOrView} = require('../grantAccessToTableOrView');
const {
  getProjectId,
  getEntityId,
  getDataset,
  getTable,
  setupBeforeAll,
  teardownAfterAll,
} = require('./config');

describe('revokeTableOrViewAccess', () => {
  before(async () => {
    await setupBeforeAll();
  });

  after(async () => {
    await teardownAfterAll();
  });

  it('should revoke access to a table for a specific role', async () => {
    const dataset = await getDataset();
    const projectId = await getProjectId();
    const table = await getTable();
    const entityId = getEntityId();

    const ROLE = 'roles/bigquery.dataViewer';
    const PRINCIPAL_ID = `group:${entityId}`;

    // Get the initial empty policy.
    const [emptyPolicy] = await table.getIamPolicy();

    // Initialize bindings if they do not exist.
    if (!emptyPolicy.bindings) {
      emptyPolicy.bindings = [];
    }

    // Grant access.
    const policyWithRole = await grantAccessToTableOrView(
      projectId,
      dataset.id,
      table.id,
      PRINCIPAL_ID,
      ROLE
    );

    // Check that there is a binding with that role.
    const hasRole = policyWithRole.some(b => b.role === ROLE);
    assert.isTrue(hasRole);

    // Revoke access for the role.
    const policyWithRevokedRole = await revokeAccessToTableOrView(
      projectId,
      dataset.id,
      table.id,
      ROLE,
      null
    );

    // Check that this role is not present in the policy anymore.
    const roleExists = policyWithRevokedRole.some(b => b.role === ROLE);
    assert.isFalse(roleExists);
  });

  it('should revoke access to a table for a specific principal', async () => {
    const dataset = await getDataset();
    const projectId = await getProjectId();
    const table = await getTable();
    const entityId = getEntityId();

    const ROLE = 'roles/bigquery.dataViewer';
    const PRINCIPAL_ID = `group:${entityId}`;

    // Get the initial empty policy.
    const [emptyPolicy] = await table.getIamPolicy();

    // Initialize bindings if they do not exist.
    if (!emptyPolicy.bindings) {
      emptyPolicy.bindings = [];
    }

    // Grant access.
    const updatedPolicy = await grantAccessToTableOrView(
      projectId,
      dataset.id,
      table.id,
      PRINCIPAL_ID,
      ROLE
    );

    // There is a binding for that principal.
    const hasPrincipal = updatedPolicy.some(
      b => b.members && b.members.includes(PRINCIPAL_ID)
    );
    assert.isTrue(hasPrincipal);

    // Revoke access for the principal.
    const policyWithRemovedPrincipal = await revokeAccessToTableOrView(
      projectId,
      dataset.id,
      table.id,
      null,
      PRINCIPAL_ID
    );

    // This principal is not present in the policy anymore.
    const hasPrincipalAfterRevoke = policyWithRemovedPrincipal.some(
      b => b.members && b.members.includes(PRINCIPAL_ID)
    );
    assert.isFalse(hasPrincipalAfterRevoke);
  });
});
