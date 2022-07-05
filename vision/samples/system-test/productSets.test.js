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

const productSearch = new vision.ProductSearchClient();
const cmd = 'node productSearch';
let testProductSet;

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

describe('product sets', () => {
  let projectId;

  before(async () => {
    projectId = await productSearch.getProjectId();
    // Shared fixture data for product tests
    testProductSet = {
      projectId,
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
      } catch (err) {
        // ignore error
      }
    });
  });

  it('should create product set', async () => {
    const newProductSetId = `ProductSetId${uuid.v4()}`;
    const newProductSetPath = productSearch.productSetPath(
      testProductSet.projectId,
      testProductSet.location,
      newProductSetId
    );
    assert.strictEqual(await getProductSetOrFalse(newProductSetPath), false);
    testProductSet.createdProductSetPaths.push(newProductSetPath);

    const output = execSync(
      `${cmd}/createProductSet "${testProductSet.projectId}" "${testProductSet.location}" "${newProductSetId}" "${testProductSet.productSetDisplayName}"`
    );

    assert.match(output, new RegExp(`Product Set name: ${newProductSetPath}`));

    const newProductSet = await getProductSetOrFalse(newProductSetPath);
    assert.strictEqual(
      newProductSet.displayName,
      testProductSet.productSetDisplayName
    );
  });

  it('should get product set', async () => {
    const output = execSync(
      `${cmd}/getProductSet "${testProductSet.projectId}" "${testProductSet.location}" "${testProductSet.productSetId}"`
    );

    assert.match(
      output,
      new RegExp(`Product Set name: ${testProductSet.productSetPath}`)
    );
    assert.match(
      output,
      new RegExp(
        `Product Set display name: ${testProductSet.productSetDisplayName}`
      )
    );
  });

  it('should list product sets', async () => {
    const output = execSync(
      `${cmd}/listProductSets "${testProductSet.projectId}" "${testProductSet.location}"`
    );

    assert.match(
      output,
      new RegExp(`Product Set name: ${testProductSet.productSetPath}`)
    );
    assert.match(
      output,
      new RegExp(
        `Product Set display name: ${testProductSet.productSetDisplayName}`
      )
    );
  });

  it('should purge a product set', async () => {
    const output = execSync(
      `${cmd}/purgeProductsInProductSet "${testProductSet.projectId}" "${testProductSet.location}" "${testProductSet.productSetId}"`
    );

    assert.match(output, new RegExp('Products removed from product set.'));
  });

  it('should delete product sets', async () => {
    const productSet = await productSearch.getProductSet({
      name: `${testProductSet.productSetPath}`,
    });
    assert.ok(productSet);

    const output = execSync(
      `${cmd}/deleteProductSet "${testProductSet.projectId}" "${testProductSet.location}" "${testProductSet.productSetId}"`
    );

    assert.match(output, /deleted/);
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
