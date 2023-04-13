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

let testProduct;

describe('reference images', () => {
  let projectId;
  before(async () => {
    projectId = await productSearchClient.getProjectId();
    // Shared fixture data for product tests
    testProduct = {
      projectId,
      location: 'us-west1',
      productId: 'test_product_ref_image_id_1',
      productDisplayName: 'test_product_display_name_1',
      productCategory: 'homegoods',
      productReferenceImageId: `ReferenceImage${uuid.v4()}`,
      productImageUri:
        'gs://cloud-samples-data/vision/product_search/shoes_1.jpg',
    };
    testProduct.productPath = productSearchClient.productPath(
      testProduct.projectId,
      testProduct.location,
      testProduct.productId
    );
    testProduct.createdProductPaths = [];

    // Create a test product for each test
    await productSearchClient.createProduct({
      parent: productSearchClient.locationPath(
        testProduct.projectId,
        testProduct.location
      ),
      productId: testProduct.productId,
      product: {
        displayName: testProduct.productDisplayName,
        productCategory: testProduct.productCategory,
      },
    });
    testProduct.createdProductPaths.push(testProduct.productPath);
  });

  after(async () => {
    // Delete products after each test
    testProduct.createdProductPaths.forEach(async path => {
      try {
        await productSearchClient.deleteProduct({name: path});
      } catch (err) {
        // ignore error
      }
    });
  });

  it('should create reference image', async () => {
    const output = execSync(
      `${cmd}/createReferenceImage "${testProduct.projectId}" "${testProduct.location}" "${testProduct.productId}" "${testProduct.productReferenceImageId}" "${testProduct.productImageUri}"`
    );
    assert.match(output, /response.uri: gs:\/\//);
  });

  it('should delete reference image', async () => {
    const output = execSync(
      `${cmd}/deleteReferenceImage "${testProduct.projectId}" "${testProduct.location}" "${testProduct.productId}" "${testProduct.productReferenceImageId}"`
    );

    assert.match(output, /Reference image deleted from product./);
  });
});
