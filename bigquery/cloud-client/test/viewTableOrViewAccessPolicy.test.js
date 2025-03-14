// Copyright 2025 Google LLC
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

const {describe, it, beforeEach, afterEach} = require('mocha');
const assert = require('assert');
const sinon = require('sinon');

const {setupBeforeAll, cleanupResources} = require('./config');
const {viewTableOrViewAccessPolicy} = require('../viewTableOrViewAccessPolicy');

describe('viewTableOrViewAccessPolicy', () => {
  let datasetId = null;
  let tableId = null;
  let viewId = null;
  const projectId = process.env.GCLOUD_PROJECT;

  beforeEach(async () => {
    const response = await setupBeforeAll();
    datasetId = response.datasetId;
    tableId = response.tableId;
    viewId = response.viewId;

    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  afterEach(async () => {
    await cleanupResources(datasetId);
    console.log.restore();
    console.error.restore();
  });

  it('should view table access policies', async () => {
    // View the table access policy
    await viewTableOrViewAccessPolicy(projectId, datasetId, tableId);

    // Check that the right messages were logged
    assert.strictEqual(
      console.log.calledWith(
        `Access Policy details for table or view '${tableId}'.`
      ),
      true
    );

    assert.ok(
      console.log.calledWith(sinon.match('Bindings:')),
      'Should log bindings information'
    );

    assert.ok(
      console.log.calledWith(sinon.match('etag:')),
      'Should log etag information'
    );

    assert.ok(
      console.log.calledWith(sinon.match('Version:')),
      'Should log version information'
    );
  });

  it('should view view access policies', async () => {
    // View the view access policy
    await viewTableOrViewAccessPolicy(projectId, datasetId, viewId);

    // Check that the right messages were logged
    assert.strictEqual(
      console.log.calledWith(
        `Access Policy details for table or view '${viewId}'.`
      ),
      true
    );

    assert.ok(
      console.log.calledWith(sinon.match('Bindings:')),
      'Should log bindings information'
    );

    assert.ok(
      console.log.calledWith(sinon.match('etag:')),
      'Should log etag information'
    );

    assert.ok(
      console.log.calledWith(sinon.match('Version:')),
      'Should log version information'
    );
  });
});
