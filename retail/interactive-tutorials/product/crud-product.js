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

  // Instantiates a client.
  const retailClient = new ProductServiceClient();

  const projectId = await retailClient.getProjectId();

  // The parent catalog resource name
  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch`;

  // The ID to use for the product
  const productId = generatedProductId
    ? generatedProductId
    : Math.random().toString(36).slice(2).toUpperCase();

  // Full resource name of Product
  const name = `${parent}/products/${productId}`;

  // The product to create.
  const productForCreate = {
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

  // The product to update.
  const productForUpdate = {
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

  const callCreateProduct = async () => {
    // Construct request
    const request = {
      parent,
      product: productForCreate,
      productId,
    };
    console.log('Create product request:', request);

    // Run request
    const response = await retailClient.createProduct(request);
    console.log('Created product:', response);
    return response[0];
  };

  const callGetProduct = async () => {
    // Construct request
    const request = {
      name,
    };
    console.log('Get product request:', request);

    // Run request
    const response = await retailClient.getProduct(request);
    console.log('Get product response:', response);

    return response[0];
  };

  const callUpdateProduct = async () => {
    // Construct request
    const request = {
      product: productForUpdate,
    };
    console.log('Update product request:', request);

    // Run request
    const response = await retailClient.updateProduct(request);
    console.log('Updated product:', response);

    return response[0];
  };

  const callDeleteProduct = async () => {
    // Construct request
    const request = {
      name,
    };
    console.log('Delete product request:', request);

    // Run request
    await retailClient.deleteProduct(request);
  };

  console.log('Start CRUD product');
  // Create product
  console.log('Start to create the product');
  const createdProduct = await callCreateProduct();
  console.log(`Product ${createdProduct.id} creation finished`);

  // Get product
  console.log('Start product get operation');
  const foundProduct = await callGetProduct();
  console.log(`Product ${foundProduct.id} get operation finished`);

  // Update product
  console.log('Start product update');
  const updatedProduct = await callUpdateProduct();
  console.log(
    `Product ${updatedProduct.id} update finished: `,
    JSON.stringify(updatedProduct)
  );

  // Delete product
  console.log('Start deleting the product');
  await callDeleteProduct();
  console.log(`Product ${createdProduct.id} deleted`);
  console.log('CRUD product finished');
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
