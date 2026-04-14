// Copyright 2026 Google LLC
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

const {assert} = require('chai');
const {ProductServiceClient} = require('@google-cloud/retail');
const {searchOffset} = require('../searchOffset');
const {searchPagination} = require('../searchPagination');
const {searchRequest} = require('../searchRequest');

describe('Snippets System Tests', function () {
  this.timeout(180000);

  const productClient = new ProductServiceClient();

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const placementId = 'default_search';
  const visitorId = 'test-visitor';
  const query = 'Mocha';

  // Generate a unique ID for the test product
  const productId = `test_product_${Date.now()}`;

  let originalConsoleLog;
  let consoleOutput = [];

  before(async () => {
    assert.isOk(
      projectId,
      'GOOGLE_CLOUD_PROJECT environment variable is required to run tests.'
    );

    const parent = productClient.branchPath(
      projectId,
      'global',
      'default_catalog',
      'default_branch'
    );

    const product = {
      title: 'Mocha Test Product Offset',
      type: 'PRIMARY',
      categories: ['Test Category'],
      availability: 'IN_STOCK',
      priceInfo: {
        price: 15.0,
        currencyCode: 'USD',
      },
    };

    console.log(`Creating test product: ${productId}...`);
    await productClient.createProduct({
      parent: parent,
      product: product,
      productId: productId,
    });
  });

  after(async () => {
    const name = productClient.productPath(
      projectId,
      'global',
      'default_catalog',
      'default_branch',
      productId
    );

    console.log(`Cleaning up: Deleting test product ${productId}...`);
    try {
      await productClient.deleteProduct({name: name});
      console.log('Product deleted successfully.');
    } catch (error) {
      console.error(
        `Error deleting product (manual cleanup may be required): ${error.message}`
      );
    }
  });

  // Intercept the console before each test to capture the sample's logs
  beforeEach(() => {
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
  });

  // Restore the console after each test
  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('should execute searchOffset and find the created product', async () => {
    const offset = 0; // Using offset 0 for the real test to ensure we find the first result
    await searchOffset(projectId, placementId, visitorId, query, offset);

    const output = consoleOutput.join('\n');
    assert.include(output, `--- Results for offset: ${offset} ---`);
  });

  it('should execute searchPagination and handle pages', async () => {
    await searchPagination(projectId, placementId, visitorId, '');

    const output = consoleOutput.join('\n');

    assert.include(output, '--- First Page ---');
    assert.include(output, 'No more pages.');
  });

  it('should execute searchRequest successfully', async () => {
    const pageCategories = ['Test Category'];

    await searchRequest(
      projectId,
      placementId,
      visitorId,
      query,
      pageCategories
    );

    const output = consoleOutput.join('\n');
    assert.include(output, '--- Search Results ---');
  });
});
