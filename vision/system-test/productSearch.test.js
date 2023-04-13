// Copyright 2018 Google LLC
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

const uuid = require('uuid');
const vision = require('@google-cloud/vision');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const productSearchClient = new vision.ProductSearchClient();
const cmd = 'node productSearch';

// Refs: https://github.com/googleapis/nodejs-vision/issues/1025
describe('product search', () => {
  let projectId;
  let testProductSet;

  before(async () => {
    projectId = await productSearchClient.getProjectId();

    // Shared fixture data for product tests
    testProductSet = {
      projectId,
      location: 'us-west1',
      productCategory: 'homegoods',
      productId: `test_product_id${uuid.v4()}`,
      productDisplayName: 'test_product_display_name_1',
      productSetId: `test_product_set_id${uuid.v4()}`,
      productSetDisplayName: 'test_product_set_display_name_1',
      createdProductPaths: [],
      createdProductSetPaths: [],
    };

    testProductSet.productSetPath = productSearchClient.productSetPath(
      testProductSet.projectId,
      testProductSet.location,
      testProductSet.productSetId
    );

    // Create a test product set for each test
    await productSearchClient.createProduct({
      parent: productSearchClient.locationPath(
        testProductSet.projectId,
        testProductSet.location
      ),
      productId: testProductSet.productId,
      product: {
        displayName: testProductSet.productDisplayName,
        productCategory: testProductSet.productCategory,
      },
    });
    testProductSet.createdProductPaths.push(testProductSet.productPath);

    await productSearchClient.createProductSet({
      parent: productSearchClient.locationPath(
        testProductSet.projectId,
        testProductSet.location
      ),
      productSetId: testProductSet.productSetId,
      productSet: {
        displayName: testProductSet.productSetDisplayName,
      },
    });
    testProductSet.createdProductSetPaths.push(
      testProductSet.createdProductSetPaths
    );
  });

  after(async () => {
    // Delete products sets after each test
    testProductSet.createdProductSetPaths.forEach(async path => {
      try {
        await productSearchClient.deleteProductSet({name: path});
      } catch (err) {
        // ignore error
      }
    });
    testProductSet.createdProductPaths.forEach(async path => {
      try {
        await productSearchClient.deleteProduct({name: path});
      } catch (err) {
        // ignore error
      }
    });
  });

  it('should add product to product set', async () => {
    const output = execSync(
      `${cmd}/addProductToProductSet "${testProductSet.projectId}" "${testProductSet.location}" "${testProductSet.productId}" "${testProductSet.productSetId}"`
    );
    assert.match(output, /Product added to product set./);
  });

  it('should remove a product from a product set', async () => {
    const output = execSync(
      `${cmd}/removeProductFromProductSet "${testProductSet.projectId}" "${testProductSet.location}" "${testProductSet.productId}" "${testProductSet.productSetId}"`
    );
    assert.match(output, /Product removed from product set./);
  });
});
