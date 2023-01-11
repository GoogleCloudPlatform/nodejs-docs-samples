// Copyright 2022 Google Inc. All Rights Reserved.
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

async function main(generatedProductId) {
  // Imports the Google Cloud client library.
  const {ProductServiceClient} = require('@google-cloud/retail').v2;
  const utils = require('../setup/setup-cleanup');

  // Instantiates a client.
  const retailClient = new ProductServiceClient();

  const projectId = await retailClient.getProjectId();

  // The parent catalog resource name
  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch`;

  // The ID to use for the product
  const productId = generatedProductId
    ? generatedProductId
    : Math.random().toString(36).slice(2).toUpperCase();

  // The product to create.
  const product = {
    title: 'Nest Mini',
    type: 'PRIMARY',
    categories: ['Speakers and displays'],
    brands: ['Google'],
    priceInfo: {
      price: 30.0,
      originalPrice: 35.5,
      currencyCode: 'USD',
    },
    availability: 'IN_STOCK',
  };

  const callCreateProduct = async () => {
    // Construct request
    const request = {
      parent,
      product,
      productId,
    };
    console.log('Create product request:', request);

    // Run request
    const response = await retailClient.createProduct(request);
    console.log('Created product:', response);
    return response[0];
  };

  // Create product
  console.log('Start to create the product');
  const createdProduct = await callCreateProduct();
  console.log(`Product ${createdProduct.id} creation ended`);

  // Delete product
  await utils.deleteProduct(createdProduct.name);
  console.log(`Product ${createdProduct.id} deleted`);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
