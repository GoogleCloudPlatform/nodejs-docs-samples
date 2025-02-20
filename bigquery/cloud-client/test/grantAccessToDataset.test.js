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

const {assert} = require('chai');
const sinon = require('sinon');
const {BigQuery} = require('@google-cloud/bigquery');
const {grantAccessToDataset} = require('../src/grantAccessToDataset');

describe('grantAccessToDataset', () => {
  const datasetId = 'test_dataset';
  const entityId = 'test-group@example.com';
  const role = 'READER';

  let datasetStub;
  let getMetadataStub;
  let setMetadataStub;

  beforeEach(() => {
    // Initial empty metadata
    const initialMetadata = {
      access: [],
    };

    // Updated metadata with new access
    const updatedMetadata = {
      access: [
        {
          role: role,
          groupByEmail: entityId,
        },
      ],
    };

    // Create stubs for dataset methods
    getMetadataStub = sinon.stub().resolves([initialMetadata]);
    setMetadataStub = sinon.stub().resolves([updatedMetadata]);

    // Create dataset stub
    datasetStub = {
      getMetadata: getMetadataStub,
      setMetadata: setMetadataStub,
    };

    // Replace BigQuery constructor
    sinon.stub(BigQuery.prototype, 'dataset').callsFake(() => datasetStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should grant access to a dataset', async () => {
    const result = await grantAccessToDataset({
      datasetId,
      entityId,
      role,
    });

    // Verify getMetadata was called
    assert.strictEqual(
      getMetadataStub.callCount,
      1,
      'getMetadata should be called once'
    );

    // Verify setMetadata was called with correct parameters
    const setMetadataCall = setMetadataStub.getCall(0);
    assert.deepStrictEqual(
      setMetadataCall.args[0].access,
      [
        {
          role: role,
          groupByEmail: entityId,
        },
      ],
      'setMetadata should be called with correct access entries'
    );

    // Verify the result contains the expected access entry
    assert.isArray(result, 'Result should be an array');
    assert.deepStrictEqual(
      result[0],
      {
        role: role,
        groupByEmail: entityId,
      },
      'Result should contain the new access entry'
    );
  });

  it('should handle concurrent modification errors', async () => {
    // Simulate a 412 Precondition Failed error
    const error = new Error('Precondition Failed');
    error.code = 412;
    setMetadataStub.rejects(error);

    try {
      await grantAccessToDataset({
        datasetId,
        entityId,
        role,
      });
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.strictEqual(err.code, 412, 'Should throw 412 error');
    }
  });

  it('should propagate other errors', async () => {
    const errorMessage = 'Unknown error';
    const error = new Error(errorMessage);
    setMetadataStub.rejects(error);

    try {
      await grantAccessToDataset({
        datasetId,
        entityId,
        role,
      });
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.strictEqual(err.message, errorMessage);
    }
  });
});
