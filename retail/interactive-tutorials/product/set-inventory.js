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
    generatedProductId,
    true
  );

  // The inventory information to update
  const product = {
    id: createdProduct.id,
    name: createdProduct.name,
    priceInfo: {
      price: 15.0,
      originalPrice: 20.0,
      cost: 8.0,
      currencyCode: 'USD',
    },
    fulfillmentInfo: [
      {
        type: 'same-day-delivery',
        placeIds: ['store3', 'store4'],
      },
    ],
    availableQuantity: {
      value: 2,
    },
    availability: 'IN_STOCK',
  };

  // If set to true, and the product with name is not found, the
  // inventory update will still be processed and retained for at most 1 day until the product is created
  const allowMissing = true;

  const callSetInventory = async () => {
    // Construct request
    const request = {
      inventory: product,
      allowMissing,
    };

    // To send an out-of-order request assign the invalid setTime here:
    // request.setTime = {seconds: Math.round(Date.now() / 1000) - 86400};

    console.log('Set inventory request:', request);
    console.log('Waiting to complete set inventory operation...');

    // Run request
    const [operation] = await retailClient.setInventory(request);
    await operation.promise();
  };

  // Set inventory
  console.log('Start set inventory');
  await callSetInventory();

  // Get product
  const changedProduct = await utils.getProduct(createdProduct.name);
  console.log(
    `Updated product ${createdProduct.id} with current time: `,
    JSON.stringify(changedProduct[0])
  );

  console.log('Set inventory finished');

  // Delete product
  await utils.deleteProduct(createdProduct.name);
  console.log(`Product ${createdProduct.id} deleted`);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
