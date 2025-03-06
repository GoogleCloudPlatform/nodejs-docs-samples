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

const {expect} = require('chai');
const {
  getDataset,
  getEntityId,
  setupBeforeAll,
  teardownAfterAll,
} = require('./config');
const {grantAccessToDataset} = require('../grantAccessToDataset');

describe('grantAccessToDataset', () => {
  // Set up fixtures before all tests (similar to pytest's module scope).
  before(async () => {
    await setupBeforeAll();
  });

  // Clean up after all tests.
  after(async () => {
    await teardownAfterAll();
  });

  it('should add entity to access entries', async () => {
    const dataset = await getDataset();
    const entityId = getEntityId();

    console.log({dataset});
    console.log({entityId});

    // Act: Grant access to the dataset.
    const accessEntries = await grantAccessToDataset(
      dataset.id,
      entityId,
      'READER'
    );

    // Assert: Check if entity was added to access entries.
    const updatedEntityIds = accessEntries
      .filter(entry => entry !== null)
      .map(entry => {
        // Handle different entity types.
        if (entry.groupByEmail) {
          return entry.groupByEmail;
        } else if (entry.userByEmail) {
          return entry.userByEmail;
        } else if (entry.specialGroup) {
          return entry.specialGroup;
        }
        return null;
      })
      .filter(id => id !== null);

    // Check if our entity ID is in the updated access entries.
    expect(updatedEntityIds).to.include(entityId);
  });
});
