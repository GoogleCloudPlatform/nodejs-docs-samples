// Copyright 2022 Google Inc.
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

  // Create product
  const createdProduct = await utils.createProduct(
    projectId,
    generatedProductId
  );

  // The ID to use for the product
  const productId = createdProduct.id;

  // The parent catalog resource name
  const name = createdProduct.name;

  // The product to update.
  const product = {
    productId,
    name,
    title: 'Updated Nest Mini',
    type: 'PRIMARY',
    categories: ['Updated Speakers and displays'],
    brands: ['Updated Google'],
    priceInfo: {
      price: 20.0,
      originalPrice: 25.5,
      currencyCode: 'EUR',
    },
    availability: 'OUT_OF_STOCK',
  };

  const callUpdateProduct = async () => {
    // Construct request
    const request = {
      product,
    };
    console.log('Update product request:', request);

    // Run request
    const response = await retailClient.updateProduct(request);
    console.log('Updated product:', response);

    return response[0];
  };

  // Update product
  console.log('Start product update');
  const updatedProduct = await callUpdateProduct();
  console.log(
    `Product ${updatedProduct.id} update finished: `,
    JSON.stringify(updatedProduct)
  );

  // Delete product
  await utils.deleteProduct(updatedProduct.name);
  console.log(`Product ${updatedProduct.id} deleted`);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
