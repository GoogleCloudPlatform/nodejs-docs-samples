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
const uuid = require(`uuid`);
const vision = require('@google-cloud/vision');
const productSearch = new vision.ProductSearchClient();
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);
const cmd = `node productSets.js`;
const cwd = path.join(__dirname, `..`, `productSearch`);

// Shared fixture data for product tests
const testProductSet = {
  projectId: process.env.GCLOUD_PROJECT,
  location: 'us-west1',
  productSetId: `test_product_set_id${uuid.v4()}`,
  productSetDisplayName: 'test_product_set_display_name_1',
};
testProductSet.productSetPath = productSearch.productSetPath(
  testProductSet.projectId,
  testProductSet.location,
  testProductSet.productSetId
);
testProductSet.createdProductSetPaths = [];

// Helper function: returns product set if exists else false
async function getProductSetOrFalse(productSetPath) {
  try {
    const response = await productSearch.getProductSet({name: productSetPath});
    return response[0];
  } catch (err) {
    if (err.message.includes('Not found')) {
      return false;
    } else {
      throw err;
    }
  }
}

describe(`product sets`, () => {
  before(tools.checkCredentials);

  before(async () => {
    // Create a test product set for each test
    await productSearch.createProductSet({
      parent: productSearch.locationPath(
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
        await productSearch.deleteProductSet({name: path});
      } catch (err) {} // ignore error
    });
  });

  it(`should create product set`, async () => {
    const newProductSetId = `ProductSetId${uuid.v4()}`;
    const newProductSetPath = productSearch.productSetPath(
      testProductSet.projectId,
      testProductSet.location,
      newProductSetId
    );
    assert.strictEqual(await getProductSetOrFalse(newProductSetPath), false);
    testProductSet.createdProductSetPaths.push(newProductSetPath);

    const output = await tools.runAsync(
      `${cmd} createProductSet "${testProductSet.projectId}" "${
        testProductSet.location
      }" "${newProductSetId}" "${testProductSet.productSetDisplayName}"`,
      cwd
    );

    assert.ok(output.includes(`Product Set name: ${newProductSetPath}`));

    const newProductSet = await getProductSetOrFalse(newProductSetPath);
    assert.ok(
      newProductSet.displayName === testProductSet.productSetDisplayName
    );
  });

  it(`should get product set`, async () => {
    const output = await tools.runAsync(
      `${cmd} getProductSet "${testProductSet.projectId}" "${
        testProductSet.location
      }" "${testProductSet.productSetId}"`,
      cwd
    );

    assert.ok(
      output.includes(`Product Set name: ${testProductSet.productSetPath}`)
    );
    assert.ok(
      output.includes(
        `Product Set display name: ${testProductSet.productSetDisplayName}`
      )
    );
  });

  it(`should list product sets`, async () => {
    const output = await tools.runAsync(
      `${cmd} listProductSets "${testProductSet.projectId}" "${
        testProductSet.location
      }"`,
      cwd
    );

    assert.ok(
      output.includes(`Product Set name: ${testProductSet.productSetPath}`)
    );
    assert.ok(
      output.includes(
        `Product Set display name: ${testProductSet.productSetDisplayName}`
      )
    );
  });

  it(`should delete product sets`, async () => {
    const productSet = await productSearch.getProductSet({
      name: `${testProductSet.productSetPath}`,
    });
    assert.ok(productSet);

    const output = await tools.runAsync(
      `${cmd} deleteProductSet "${testProductSet.projectId}" "${
        testProductSet.location
      }" "${testProductSet.productSetId}"`,
      cwd
    );

    assert.ok(output.includes('deleted'));
    try {
      await productSearch.getProductSet({
        name: `${testProductSet.productSetPath}`,
      });
      assert.fail('Product set was not deleted');
    } catch (err) {
      assert.ok(err.message.includes('Not found'));
    }
  });
});
