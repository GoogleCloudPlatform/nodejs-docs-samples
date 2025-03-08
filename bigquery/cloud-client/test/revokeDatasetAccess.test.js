// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {describe, it, before, after} = require('mocha');
const assert = require('assert');
const {grantAccessToDataset} = require('../grantAccessToDataset');
const {revokeDatasetAccess} = require('../revokeDatasetAccess');
const {
  getDataset,
  getEntityId,
  setupBeforeAll,
  teardownAfterAll,
} = require('./config');

describe('revokeDatasetAccess', () => {
  // Setup resources before all tests.
  before(async () => {
    await setupBeforeAll();
  });

  // Clean up resources after all tests.
  after(async () => {
    await teardownAfterAll();
  });

  it('should revoke access to a dataset', async () => {
    // Get test resources.
    const dataset = await getDataset();
    const entityId = getEntityId();

    // Directly use the dataset ID.
    const datasetId = dataset.id;
    console.log(`Testing with dataset: ${datasetId} and entity: ${entityId}`);

    // First grant access to the dataset.
    const datasetAccessEntries = await grantAccessToDataset(
      datasetId,
      entityId,
      'READER'
    );

    // Create a set of all entity IDs and email addresses to check.
    const datasetEntityIds = new Set();
    datasetAccessEntries.forEach(entry => {
      if (entry.entity_id) {
        datasetEntityIds.add(entry.entity_id);
      }
      if (entry.userByEmail) {
        datasetEntityIds.add(entry.userByEmail);
      }
      if (entry.groupByEmail) {
        datasetEntityIds.add(entry.groupByEmail);
      }
    });

    // Check if our entity ID is in the set.
    const hasAccess = datasetEntityIds.has(entityId);
    console.log(`Entity ${entityId} has access after granting: ${hasAccess}`);
    assert.strictEqual(
      hasAccess,
      true,
      'Entity should have access after granting'
    );

    // Now revoke access.
    const newAccessEntries = await revokeDatasetAccess(datasetId, entityId);

    // Check that the entity no longer has access.
    const updatedEntityIds = new Set();
    newAccessEntries.forEach(entry => {
      if (entry.entity_id) {
        updatedEntityIds.add(entry.entity_id);
      }
      if (entry.userByEmail) {
        updatedEntityIds.add(entry.userByEmail);
      }
      if (entry.groupByEmail) {
        updatedEntityIds.add(entry.groupByEmail);
      }
    });

    const stillHasAccess = updatedEntityIds.has(entityId);
    console.log(
      `Entity ${entityId} has access after revoking: ${stillHasAccess}`
    );
    assert.strictEqual(
      stillHasAccess,
      false,
      'Entity should not have access after revoking'
    );
  });
});
