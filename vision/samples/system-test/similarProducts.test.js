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
const vision = require('@google-cloud/vision');
const productSearch = new vision.ProductSearchClient();
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);
const cmd = `node similarProducts.js`;
const cwd = path.join(__dirname, `..`, `productSearch`);
const filter = ['', 'style=womens'];
const localPath = './../resources/shoes_1.jpg';
const gcsUri = 'gs://nodejs-docs-samples/product-search/shoes_1.jpg';

// Shared fixture data for product tests
//Need to have a product set already imported and indexed
// (gs://nodejs-docs-samples/product-search/indexed_product_sets.csv)
const testSimilarProducts = {
  projectId: process.env.GCLOUD_PROJECT,
  location: 'us-west1',
  productSetId: 'indexed_product_set_id_for_testing',
  productCategory: 'apparel',
};
testSimilarProducts.productPath = productSearch.productSetPath(
  testSimilarProducts.projectId,
  testSimilarProducts.location,
  testSimilarProducts.productSetId
);

describe(`similar products`, () => {
  it(`should check if similar product exists to one provided in local file with no filter`, async () => {
    const output = await tools.runAsync(
      `${cmd} getSimilarProductsFile "${testSimilarProducts.projectId}" "${
        testSimilarProducts.location
      }" "${testSimilarProducts.productSetId}" "${
        testSimilarProducts.productCategory
      }" "${localPath}" "${filter[0]}"`,
      cwd
    );
    assert.ok(output.includes(`Similar product information:`));
    assert.ok(
      output.includes(
        `Product category: ${testSimilarProducts.productCategory}`
      )
    );
    assert.ok(output.includes(`Product id: indexed_product_id_for_testing_1`));
    assert.ok(output.includes(`Product id: indexed_product_id_for_testing_2`));
  });

  it(`should check if similar product exists to one provided in local file with filter`, async () => {
    const output = await tools.runAsync(
      `${cmd} getSimilarProductsFile "${testSimilarProducts.projectId}" "${
        testSimilarProducts.location
      }" "${testSimilarProducts.productSetId}" "${
        testSimilarProducts.productCategory
      }" "${localPath}" "${filter[1]}"`,
      cwd
    );
    assert.ok(output.includes(`Similar product information:`));
    assert.ok(
      output.includes(
        `Product category: ${testSimilarProducts.productCategory}`
      )
    );
    assert.ok(output.includes(`Product id: indexed_product_id_for_testing_1`));
  });

  it(`should check if similar product exists to one provided in GCS file with no filter`, async () => {
    const output = await tools.runAsync(
      `${cmd} getSimilarProductsGcs "${testSimilarProducts.projectId}" "${
        testSimilarProducts.location
      }" "${testSimilarProducts.productSetId}" "${
        testSimilarProducts.productCategory
      }" "${gcsUri}" "${filter[0]}"`,
      cwd
    );
    assert.ok(output.includes(`Similar product information:`));
    assert.ok(
      output.includes(
        `Product category: ${testSimilarProducts.productCategory}`
      )
    );
    assert.ok(output.includes(`Product id: indexed_product_id_for_testing_1`));
    assert.ok(output.includes(`Product id: indexed_product_id_for_testing_2`));
  });

  it(`should check if similar product exists to one provided in GCS file with filter`, async () => {
    const output = await tools.runAsync(
      `${cmd} getSimilarProductsGcs "${testSimilarProducts.projectId}" "${
        testSimilarProducts.location
      }" "${testSimilarProducts.productSetId}" "${
        testSimilarProducts.productCategory
      }" "${gcsUri}" "${filter[1]}"`,
      cwd
    );
    assert.ok(output.includes(`Similar product information:`));
    assert.ok(
      output.includes(
        `Product category: ${testSimilarProducts.productCategory}`
      )
    );
    assert.ok(output.includes(`Product id: indexed_product_id_for_testing_1`));
  });
});
