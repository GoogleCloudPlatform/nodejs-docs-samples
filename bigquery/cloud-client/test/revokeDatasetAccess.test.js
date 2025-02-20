// Copyright 2024 Google LLC
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

const {assert} = require('chai');
const sinon = require('sinon');
const {BigQuery} = require('@google-cloud/bigquery');
const {revokeDatasetAccess} = require('../revokeDatasetAccess');

describe('revokeDatasetAccess', () => {
  const datasetId = 'test_dataset';
  const entityId = 'user@example.com';
  let sandbox;
  let mockBigQuery;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock the BigQuery constructor
    mockBigQuery = sandbox.stub(BigQuery.prototype);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully revoke access from a dataset', async () => {
    const initialAccess = [
      {
        role: 'READER',
        userByEmail: entityId,
      },
    ];

    const dataset = {
      id: datasetId,
      metadata: {
        access: initialAccess,
      },
      setMetadata: sandbox.stub().resolves([
        {
          metadata: {
            access: [],
          },
        },
      ]),
    };

    // Mock the dataset method to return our mock dataset
    mockBigQuery.dataset = sandbox.stub().returns({
      get: sandbox.stub().resolves([dataset]),
    });

    // Execute revoke access
    const updatedAccess = await revokeDatasetAccess({
      datasetId,
      entityId,
    });

    // Verify the access was revoked
    assert.isArray(updatedAccess);
    assert.isEmpty(updatedAccess);
  });

  it('should handle precondition failed error', async () => {
    const preconditionError = new Error('Precondition Failed');
    preconditionError.code = 412;

    const dataset = {
      id: datasetId,
      metadata: {
        access: [],
      },
      setMetadata: sandbox.stub().rejects(preconditionError),
    };

    // Mock the dataset method to return our mock dataset
    mockBigQuery.dataset = sandbox.stub().returns({
      get: sandbox.stub().resolves([dataset]),
    });

    try {
      await revokeDatasetAccess({
        datasetId,
        entityId,
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.code, 412);
      assert.equal(error.message, 'Precondition Failed');
    }
  });

  it('should handle missing entity gracefully', async () => {
    const dataset = {
      id: datasetId,
      metadata: {
        access: [],
      },
      setMetadata: sandbox.stub().resolves([
        {
          metadata: {
            access: [],
          },
        },
      ]),
    };

    // Mock the dataset method to return our mock dataset
    mockBigQuery.dataset = sandbox.stub().returns({
      get: sandbox.stub().resolves([dataset]),
    });

    const updatedAccess = await revokeDatasetAccess({
      datasetId,
      entityId,
    });

    assert.isArray(updatedAccess);
    assert.isEmpty(updatedAccess);
  });
});
