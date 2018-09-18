/**
 * Copyright 2018, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require(`path`);
const vision = require('@google-cloud/vision').v1p3beta1;
const productSearchClient = new vision.ProductSearchClient();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const cmd = `node productSearch.v1p3beta1.js`;
const cwd = path.join(__dirname, `..`);

// Shared fixture data for product tests
const testProductSet = {
  projectId: process.env.GCLOUD_PROJECT,
  location: 'us-west1',
  productCategory: 'homegoods',
  productId: 'test_product_id_1',
  productSetId: 'test_product_set_id_1',
  productSetDisplayName: 'test_product_set_display_name_1',
};

testProductSet.productSetPath = productSearchClient.productSetPath(
  testProductSet.projectId,
  testProductSet.location,
  testProductSet.productSetId
);

testProductSet.createdProductPaths = [];
testProductSet.createdProductSetPaths = [];

test.before(tools.checkCredentials);

test.before(async () => {
  // Create a test product set for each test
  try {
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
  } catch (err) {} // ignore error

  try {
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
  } catch (err) {} // ignore error
});

test.after(async () => {
  // Delete products sets after each test
  testProductSet.createdProductSetPaths.forEach(async path => {
    try {
      await productSearchClient.deleteProductSet({name: path});
      await productSearchClient.deleteProduct({name: path});
    } catch (err) {} // ignore error
  });
});

test(`should add product to product set`, async t => {
  const output = await tools.runAsync(
    `${cmd} addProductToProductSet "${testProductSet.projectId}" "${
      testProductSet.location
    }" "${testProductSet.productId}" "${testProductSet.productSetId}"`,
    cwd
  );

  t.true(output.includes(`Product added to product set.`));
});

test(`remove a product from a product set`, async t => {
  const output = await tools.runAsync(
    `${cmd} removeProductFromProductSet "${testProductSet.projectId}" "${
      testProductSet.location
    }" "${testProductSet.productId}" "${testProductSet.productSetId}"`,
    cwd
  );

  console.log('---------------');
  console.log(output);
  console.log('---------------');

  t.true(output.includes(`Product removed from product set.`));
});
