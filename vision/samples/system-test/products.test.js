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

const cmd = 'node productSearch';

const productSearch = new vision.ProductSearchClient();

let testProduct;

// Helper function: returns product if exists else false
async function getProductOrFalse(productPath) {
  try {
    const response = await productSearch.getProduct({name: productPath});
    return response[0];
  } catch (err) {
    if (err.message.includes('Not found')) {
      return false;
    }
  }
}

describe('products', () => {
  let projectId;

  before(async () => {
    projectId = await productSearch.getProjectId();
    // Shared fixture data for product tests
    testProduct = {
      projectId,
      location: 'us-west1',
      productId: `test_products_id${uuid.v4()}`,
      productDisplayName: 'test_product_display_name_1',
      productCategory: 'homegoods',
      productKey: 'myKey',
      productValue: 'myValue',
    };
    testProduct.productPath = productSearch.productPath(
      testProduct.projectId,
      testProduct.location,
      testProduct.productId
    );
    testProduct.createdProductPaths = [];

    // Create a test product set for each test
    await productSearch.createProduct({
      parent: productSearch.locationPath(
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
    // Delete products sets after each test
    testProduct.createdProductPaths.forEach(async path => {
      try {
        await productSearch.deleteProduct({name: path});
      } catch (err) {
        // ignore error
      }
    });
  });
  it('should create product', async () => {
    const newProductId = `ProductId${uuid.v4()}`;
    const newProductPath = productSearch.productPath(
      testProduct.projectId,
      testProduct.location,
      newProductId
    );
    const maybeProduct = await getProductOrFalse(newProductPath);
    assert.strictEqual(maybeProduct, false);

    let output = execSync(
      `${cmd}/createProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}" "${testProduct.productDisplayName}" "${testProduct.productCategory}"`
    );

    assert.match(output, new RegExp(`Product name: ${newProductPath}`));

    const newProduct = await getProductOrFalse(newProductPath);
    assert.ok(newProduct.displayName === testProduct.productDisplayName);
    assert.ok(newProduct.productCategory === testProduct.productCategory);

    output = execSync(
      `${cmd}/deleteProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}"`
    );
    assert.match(output, /Product deleted./);
  });

  it('should get product', async () => {
    const newProductId = `ProductId${uuid.v4()}`;
    const newProductPath = productSearch.productPath(
      testProduct.projectId,
      testProduct.location,
      newProductId
    );
    assert.strictEqual(await getProductOrFalse(newProductPath), false);
    let output = execSync(
      `${cmd}/createProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}" "${testProduct.productDisplayName}" "${testProduct.productCategory}"`
    );

    assert.match(output, new RegExp(`Product name: ${newProductPath}`));

    output = execSync(
      `${cmd}/getProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}"`
    );

    assert.match(output, new RegExp(`Product name: ${newProductPath}`));
    assert.match(output, new RegExp(`Product id: ${newProductId}`));
    assert.match(output, /Product display name:/);
    assert.match(output, /Product description:/);
    assert.match(
      output,
      new RegExp(`Product category: ${testProduct.productCategory}`)
    );
    assert.match(output, /Product labels:/);

    output = execSync(
      `${cmd}/deleteProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}"`
    );
    assert.match(output, /Product deleted./);
  });

  it('should list products', async () => {
    const output = execSync(
      `${cmd}/listProducts "${testProduct.projectId}" "${testProduct.location}"`
    );
    assert.match(output, new RegExp(`Product id: ${testProduct.productId}`));
    assert.match(output, /Product labels:/);
  });

  it('should update product label', async () => {
    const newProductId = `ProductId${uuid.v4()}`;
    const newProductPath = productSearch.productPath(
      testProduct.projectId,
      testProduct.location,
      newProductId
    );
    let output = execSync(
      `${cmd}/createProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}" "${testProduct.productDisplayName}" "${testProduct.productCategory}"`
    );

    assert.match(output, new RegExp(`Product name: ${newProductPath}`));
    output = execSync(
      `${cmd}/updateProductLabels "${testProduct.projectId}" "${testProduct.location}" "${newProductId}" "${testProduct.productKey}" "${testProduct.productValue}"`
    );

    assert.match(
      output,
      new RegExp(
        `Product Labels: ${testProduct.productKey}: ${testProduct.productValue}`
      )
    );
    assert.match(
      output,
      new RegExp(`Product display name: ${testProduct.productDisplayName}`)
    );
    assert.match(output, /Product description:/);
    assert.match(
      output,
      new RegExp(`Product category: ${testProduct.productCategory}`)
    );
  });

  it('should delete product', async () => {
    const newProductId = `ProductId${uuid.v4()}`;
    const newProductPath = productSearch.productPath(
      testProduct.projectId,
      testProduct.location,
      newProductId
    );
    assert.strictEqual(await getProductOrFalse(newProductPath), false);
    let output = execSync(
      `${cmd}/createProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}" "${testProduct.productDisplayName}" "${testProduct.productCategory}"`
    );

    assert.match(output, new RegExp(`Product name: ${newProductPath}`));

    output = execSync(
      `${cmd}/deleteProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}"`
    );
    assert.match(output, /Product deleted./);

    try {
      await productSearch.getProduct({name: `${newProductPath}`});
      assert.fail('Product was not deleted');
    } catch (err) {
      assert.ok(err.message.includes('Not found'));
    }
  });

  it('should remove orphaned products', async () => {
    const newProductId = `ProductId${uuid.v4()}`;
    const newProductPath = productSearch.productPath(
      testProduct.projectId,
      testProduct.location,
      newProductId
    );

    assert.strictEqual(await getProductOrFalse(newProductPath), false);
    let output = execSync(
      `${cmd}/createProduct "${testProduct.projectId}" "${testProduct.location}" "${newProductId}" "${testProduct.productDisplayName}" "${testProduct.productCategory}"`
    );

    assert.match(output, new RegExp(`Product name: ${newProductPath}`));

    output = execSync(
      `${cmd}/purgeOrphanProducts "${testProduct.projectId}" "${testProduct.location}"`
    );

    assert.match(output, new RegExp('Orphan products deleted.'));
    try {
      await productSearch.getProduct({name: `${newProductPath}`});
      assert.fail('Product was not deleted');
    } catch (err) {
      assert.ok(err.message.includes('Not found'));
    }
  });
});
