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

const {beforeEach, afterEach, it, describe} = require('mocha');
const assert = require('assert');
const sinon = require('sinon');

const {setupBeforeAll, cleanupResources} = require('./config');
const {viewDatasetAccessPolicy} = require('../viewDatasetAccessPolicy');

describe('viewDatasetAccessPolicy', () => {
  let datasetId = null;

  beforeEach(async () => {
    const response = await setupBeforeAll();
    datasetId = response.datasetId;

    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  afterEach(async () => {
    await cleanupResources(datasetId);
    console.log.restore();
    console.error.restore();
  });

  it('should view dataset access policies', async () => {
    // Act: View the dataset access policy
    await viewDatasetAccessPolicy(datasetId);

    // Assert: Check that the initial message was logged
    assert.strictEqual(
      console.log.calledWith(
        sinon.match(`Access entries in dataset '${datasetId}':`)
      ),
      true
    );

    // We're not checking the exact number of entries since that might vary,
    // but we're making sure the appropriate logging format was followed
    assert.ok(
      console.log.calledWith(sinon.match(/Role:/)),
      'Should log role information'
    );

    assert.ok(
      console.log.calledWith(sinon.match(/Special group:/)),
      'Should log special group information'
    );

    assert.ok(
      console.log.calledWith(sinon.match(/User by Email:/)),
      'Should log user by email information'
    );
  });
});
