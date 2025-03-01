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
const sinon = require('sinon');
const {BigQuery} = require('@google-cloud/bigquery');
const {revokeTableOrViewAccess} = require('../revokeTableOrViewAccess');

describe('revokeTableOrViewAccess', () => {
  let bigQueryStub;
  let tableStub;
  let constructorStub;

  beforeEach(() => {
    // Create stubs for BigQuery client and its methods
    tableStub = {
      iam: {
        getPolicy: sinon.stub(),
        setPolicy: sinon.stub(),
      },
    };

    const datasetStub = {
      table: sinon.stub().returns(tableStub),
    };

    bigQueryStub = {
      dataset: sinon.stub().returns(datasetStub),
    };

    // Stub the BigQuery constructor correctly
    constructorStub = sinon.stub(BigQuery.prototype, 'constructor');
    constructorStub.returns(bigQueryStub);

    // Stub the BigQuery class itself
    sinon.stub(BigQuery.prototype, 'dataset').returns(datasetStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should revoke access for a specific member and role', async () => {
    // Setup test data
    const testPolicy = {
      bindings: [
        {
          role: 'roles/bigquery.dataViewer',
          members: ['group:test@google.com', 'group:other@google.com'],
        },
      ],
    };

    const expectedNewPolicy = {
      bindings: [
        {
          role: 'roles/bigquery.dataViewer',
          members: ['group:other@google.com'],
        },
      ],
    };

    // Configure stubs
    tableStub.iam.getPolicy.resolves([testPolicy]);
    tableStub.iam.setPolicy.resolves([]);

    // Test the function
    await revokeTableOrViewAccess({
      projectId: 'test-project',
      datasetId: 'test-dataset',
      resourceId: 'test-table',
      memberToRevoke: 'group:test@google.com',
      roleToRevoke: 'roles/bigquery.dataViewer',
    });

    // Verify the new policy was set correctly
    sinon.assert.calledWith(
      tableStub.iam.setPolicy,
      sinon.match(expectedNewPolicy)
    );
  });

  it('should revoke all access for a specific role', async () => {
    // Setup test data
    const testPolicy = {
      bindings: [
        {
          role: 'roles/bigquery.dataViewer',
          members: ['group:test@google.com'],
        },
        {
          role: 'roles/bigquery.dataEditor',
          members: ['group:editor@google.com'],
        },
      ],
    };

    const expectedNewPolicy = {
      bindings: [
        {
          role: 'roles/bigquery.dataEditor',
          members: ['group:editor@google.com'],
        },
      ],
    };

    // Configure stubs
    tableStub.iam.getPolicy.resolves([testPolicy]);
    tableStub.iam.setPolicy.resolves([]);

    // Test the function
    await revokeTableOrViewAccess({
      projectId: 'test-project',
      datasetId: 'test-dataset',
      resourceId: 'test-table',
      roleToRevoke: 'roles/bigquery.dataViewer',
    });

    // Verify the new policy was set correctly
    sinon.assert.calledWith(
      tableStub.iam.setPolicy,
      sinon.match(expectedNewPolicy)
    );
  });

  it('should handle errors appropriately', async () => {
    // Configure stub to throw an error
    tableStub.iam.getPolicy.rejects(new Error('Test error'));

    // Test the function
    try {
      await revokeTableOrViewAccess({
        projectId: 'test-project',
        datasetId: 'test-dataset',
        resourceId: 'test-table',
      });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.equal('Test error');
    }
  });
});
