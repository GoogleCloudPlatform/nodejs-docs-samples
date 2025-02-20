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

describe('viewTableOrViewAccessPolicy', () => {
  let bigQueryStub;
  let consoleLogSpy;
  let viewTableOrViewAccessPolicy;

  const samplePolicy = {
    bindings: [
      {
        role: 'roles/bigquery.dataViewer',
        members: ['user:test@example.com'],
      },
    ],
    etag: 'CAE=',
    version: 1,
  };

  beforeEach(() => {
    // Set required environment variable
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';

    // Stub BigQuery client
    bigQueryStub = {
      dataset: sinon.stub().returns({
        table: sinon.stub().returns({
          getIamPolicy: sinon.stub().resolves([samplePolicy]),
        }),
      }),
    };

    // Stub BigQuery constructor
    sinon.stub(BigQuery.prototype, 'dataset').callsFake(bigQueryStub.dataset);

    // Spy on console log methods
    consoleLogSpy = sinon.spy(console, 'log');

    // Reset module for each test
    viewTableOrViewAccessPolicy =
      require('../viewTableOrViewAccessPolicy').viewTableOrViewAccessPolicy;
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLOUD_PROJECT;
    sinon.restore();
  });

  it('should display access policy details for a table', async () => {
    const params = {
      projectId: 'test-project',
      datasetId: 'test_dataset',
      resourceName: 'test_table',
    };

    const policy = await viewTableOrViewAccessPolicy(params);

    assert.ok(bigQueryStub.dataset.calledWith(params.datasetId));
    assert.ok(bigQueryStub.dataset().table.calledWith(params.resourceName));

    assert.ok(
      consoleLogSpy.calledWith(
        `Access Policy details for table or view '${params.resourceName}':`
      )
    );
    assert.ok(
      consoleLogSpy.calledWith(
        `Bindings: ${JSON.stringify(samplePolicy.bindings, null, 2)}`
      )
    );
    assert.ok(consoleLogSpy.calledWith(`etag: ${samplePolicy.etag}`));
    assert.ok(consoleLogSpy.calledWith(`version: ${samplePolicy.version}`));

    assert.deepEqual(policy, samplePolicy);
  });

  it('should throw error when project ID is missing', async () => {
    delete process.env.GOOGLE_CLOUD_PROJECT;

    try {
      await viewTableOrViewAccessPolicy({});
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.include(error.message, 'Project ID is required');
    }
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Table not found';

    bigQueryStub.dataset.returns({
      table: sinon.stub().returns({
        getIamPolicy: sinon.stub().rejects(new Error(errorMessage)),
      }),
    });

    try {
      await viewTableOrViewAccessPolicy({
        projectId: 'test-project',
        datasetId: 'test_dataset',
        resourceName: 'non_existent_table',
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.include(error.message, errorMessage);
    }
  });
});
