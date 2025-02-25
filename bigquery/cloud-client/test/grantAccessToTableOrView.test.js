// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
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
const {grantAccessToTableOrView} = require('../grantAccessToTableOrView');

describe('grantAccessToTableOrView', () => {
  const PROJECT_ID = 'test-project';
  const DATASET_ID = 'test_dataset';
  const TABLE_ID = 'test_table';
  const ENTITY_ID = 'test-group@example.com';
  const ROLE = 'roles/bigquery.dataViewer';
  const PRINCIPAL_ID = `group:${ENTITY_ID}`;

  let sandbox;
  let bigQueryStub;
  let tableMock;
  let datasetMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create empty initial policy
    const emptyPolicy = {
      bindings: [],
    };

    // Create policy with the new binding
    const updatedPolicy = {
      bindings: [
        {
          role: ROLE,
          members: [PRINCIPAL_ID],
        },
      ],
    };

    // Create the complete mock structure
    tableMock = {
      iam: {
        getPolicy: sandbox.stub().resolves([emptyPolicy]),
        setPolicy: sandbox.stub().resolves([updatedPolicy]),
      },
    };

    datasetMock = {
      table: sandbox.stub().returns(tableMock),
    };

    bigQueryStub = sandbox.stub(BigQuery.prototype);
    bigQueryStub.dataset = sandbox.stub().returns(datasetMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should grant access to table or view', async () => {
    const updatedBindings = await grantAccessToTableOrView({
      projectId: PROJECT_ID,
      datasetId: DATASET_ID,
      resourceName: TABLE_ID,
      principalId: PRINCIPAL_ID,
      role: ROLE,
    });

    // Verify the dataset method was called
    assert.ok(
      bigQueryStub.dataset.calledWith(DATASET_ID),
      'dataset method should be called with correct dataset ID'
    );

    // Verify the table method was called with correct table ID
    assert.ok(
      datasetMock.table.calledWith(TABLE_ID),
      'table method should be called with correct table ID'
    );

    // Verify getPolicy was called
    assert.ok(tableMock.iam.getPolicy.called, 'getPolicy should be called');

    // Verify setPolicy was called
    assert.ok(tableMock.iam.setPolicy.called, 'setPolicy should be called');

    // Verify the updated bindings contain the new role
    const roleBinding = updatedBindings.find(binding => binding.role === ROLE);
    assert.exists(roleBinding, `Binding with role ${ROLE} should exist`);

    // Verify the principal was added to the members
    assert.include(
      roleBinding.members,
      PRINCIPAL_ID,
      `Principal ${PRINCIPAL_ID} should be in members list`
    );
  });

  it('should throw error when BigQuery API fails', async () => {
    // Make getPolicy throw an error
    tableMock.iam.getPolicy.rejects(new Error('API Error'));

    try {
      await grantAccessToTableOrView({
        projectId: PROJECT_ID,
        datasetId: DATASET_ID,
        resourceName: TABLE_ID,
        principalId: PRINCIPAL_ID,
        role: ROLE,
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.message, 'API Error');
    }
  });
});
