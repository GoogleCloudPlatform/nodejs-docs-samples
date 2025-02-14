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
const {viewDatasetAccessPolicy} = require('../src/viewDatasetAccessPolicy');

describe('viewDatasetAccessPolicy', () => {
  let bigQueryStub;
  let consoleLogSpy;

  const sampleAccessEntry = {
    role: 'READER',
    specialGroup: 'projectReaders',
    userByEmail: 'test@example.com',
  };

  beforeEach(() => {
    // Stub BigQuery client
    bigQueryStub = {
      dataset: sinon.stub().returns({
        getMetadata: sinon.stub().resolves([
          {
            access: [sampleAccessEntry],
          },
        ]),
      }),
    };

    // Stub BigQuery constructor
    sinon.stub(BigQuery.prototype, 'dataset').callsFake(bigQueryStub.dataset);

    // Spy on console.log
    consoleLogSpy = sinon.spy(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should display access policy details for a dataset', async () => {
    const datasetId = 'test_dataset';

    await viewDatasetAccessPolicy({datasetId});

    // Verify BigQuery client was called correctly
    assert.ok(bigQueryStub.dataset.calledWith(datasetId));

    // Verify console output
    assert.ok(consoleLogSpy.calledWith('Access entries:', [sampleAccessEntry]));
    assert.ok(
      consoleLogSpy.calledWith(
        `Details for Access entry 0 in dataset '${datasetId}':`
      )
    );
    assert.ok(consoleLogSpy.calledWith('Role: READER'));
    assert.ok(consoleLogSpy.calledWith('SpecialGroup: projectReaders'));
    assert.ok(consoleLogSpy.calledWith('UserByEmail: test@example.com'));
  });

  it('should handle datasets with no access entries', async () => {
    // Override stub to return empty access array
    bigQueryStub.dataset.returns({
      getMetadata: sinon.stub().resolves([
        {
          access: [],
        },
      ]),
    });

    await viewDatasetAccessPolicy({datasetId: 'empty_dataset'});

    // Verify only the access entries message was logged
    assert.ok(consoleLogSpy.calledWith('Access entries:', []));
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Dataset not found';

    // Override stub to throw error
    bigQueryStub.dataset.returns({
      getMetadata: sinon.stub().rejects(new Error(errorMessage)),
    });

    try {
      await viewDatasetAccessPolicy({datasetId: 'non_existent_dataset'});
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.include(error.message, errorMessage);
    }
  });
});
