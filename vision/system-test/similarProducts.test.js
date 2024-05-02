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

const vision = require('@google-cloud/vision');
const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const cp = require('child_process');
const path = require('path');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node productSearch';
const filter = ['', 'style=womens'];
const localPath = path.join(__dirname, '../resources/shoes_1.jpg');
const gcsUri = 'gs://cloud-samples-data/vision/product_search/shoes_1.jpg';

const productSearch = new vision.ProductSearchClient();

// Refs: https://github.com/googleapis/nodejs-vision/issues/1025
describe.skip('similar products', () => {
  let projectId;
  let testSimilarProducts;

  before(async () => {
    projectId = await productSearch.getProjectId();

    // Shared fixture data for product tests
    // Need to have a product set already imported and indexed
    // (gs://nodejs-docs-samples/product-search/indexed_product_sets.csv)
    testSimilarProducts = {
      projectId,
      location: 'us-west1',
      productSetId: 'indexed_product_set_id_for_testing',
      productCategory: 'apparel',
    };
    testSimilarProducts.productPath = productSearch.productSetPath(
      testSimilarProducts.projectId,
      testSimilarProducts.location,
      testSimilarProducts.productSetId
    );
  });

  it('should check if similar product exists to one provided in local file with no filter', async () => {
    const output = execSync(
      `${cmd}/getSimilarProducts "${testSimilarProducts.projectId}" "${testSimilarProducts.location}" "${testSimilarProducts.productSetId}" "${testSimilarProducts.productCategory}" "${localPath}" "${filter[0]}"`
    );
    assert.match(output, /Similar product information:/);
    assert.match(
      output,
      new RegExp(`Product category: ${testSimilarProducts.productCategory}`)
    );
    assert.match(output, /Product id: indexed_product_id_for_testing_1/);
    assert.match(output, /Product id: indexed_product_id_for_testing_2/);
  });

  it('should check if similar product exists to one provided in local file with filter', async () => {
    const output = execSync(
      `${cmd}/getSimilarProducts "${testSimilarProducts.projectId}" "${testSimilarProducts.location}" "${testSimilarProducts.productSetId}" "${testSimilarProducts.productCategory}" "${localPath}" "${filter[1]}"`
    );
    assert.match(output, /Similar product information:/);
    assert.match(
      output,
      new RegExp(`Product category: ${testSimilarProducts.productCategory}`)
    );
    assert.match(output, /Product id: indexed_product_id_for_testing_1/);
  });

  it('should check if similar product exists to one provided in GCS file with no filter', async () => {
    const output = execSync(
      `${cmd}/getSimilarProductsGcs "${testSimilarProducts.projectId}" "${testSimilarProducts.location}" "${testSimilarProducts.productSetId}" "${testSimilarProducts.productCategory}" "${gcsUri}" "${filter[0]}"`
    );
    assert.match(output, /Similar product information:/);
    assert.match(
      output,
      new RegExp(`Product category: ${testSimilarProducts.productCategory}`)
    );
    assert.match(output, /Product id: indexed_product_id_for_testing_1/);
    assert.match(output, /Product id: indexed_product_id_for_testing_2/);
  });

  it('should check if similar product exists to one provided in GCS file with filter', async () => {
    const output = execSync(
      `${cmd}/getSimilarProductsGcs "${testSimilarProducts.projectId}" "${testSimilarProducts.location}" "${testSimilarProducts.productSetId}" "${testSimilarProducts.productCategory}" "${gcsUri}" "${filter[1]}"`
    );
    assert.match(output, /Similar product information:/);
    assert.match(
      output,
      new RegExp(`Product category: ${testSimilarProducts.productCategory}`)
    );
    assert.match(output, /Product id: indexed_product_id_for_testing_1/);
  });
});
