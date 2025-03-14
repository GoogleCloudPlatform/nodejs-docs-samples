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

'use strict';

const {beforeEach, afterEach, it, describe} = require('mocha');
const assert = require('assert');
const sinon = require('sinon');

const {setupBeforeAll, cleanupResources} = require('./config');
const {grantAccessToDataset} = require('../grantAccessToDataset');
const {revokeDatasetAccess} = require('../revokeDatasetAccess');

describe('revokeDatasetAccess', () => {
  let datasetId = null;
  let entityId = null;
  const role = 'READER';

  beforeEach(async () => {
    const response = await setupBeforeAll();
    datasetId = response.datasetId;
    entityId = response.entityId;

    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  // Clean up after all tests
  afterEach(async () => {
    await cleanupResources(datasetId);
    console.log.restore();
    console.error.restore();
  });

  it('should revoke access to a dataset', async () => {
    // First grant access to the dataset
    await grantAccessToDataset(datasetId, entityId, role);

    // Reset console.log stub to clear the history of calls
    console.log.resetHistory();

    // Now revoke access
    await revokeDatasetAccess(datasetId, entityId);

    // Check if the right message was logged
    assert.strictEqual(
      console.log.calledWith(
        `Revoked access to '${entityId}' from '${datasetId}'.`
      ),
      true
    );
  });
});
