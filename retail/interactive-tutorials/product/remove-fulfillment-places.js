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

  // Create product
  const createdProduct = await utils.createProduct(
    projectId,
    generatedProductId,
    true
  );

  // Full resource name of Product
  const product = createdProduct.name;

  // The fulfillment type, including commonly used types (such as
  // pickup in store and same-day delivery), and custom types.
  const type = 'same-day-delivery';

  // The IDs for this type, such as the store IDs for "pickup-in-store" or the region IDs for
  // "same-day-delivery" to be added for this type.
  const placeIds = ['store1'];

  const callRemoveFulfillmentPlaces = async () => {
    // Construct request
    const request = {
      product,
      type,
      placeIds,
    };

    // To send an out-of-order request assign the invalid removeTime here:
    // request.removeTime = {seconds: Math.round(Date.now() / 1000) - 86400};

    console.log('Remove fulfillment request:', request);
    console.log('Waiting to complete remove operation...');

    // Run request
    const [operation] = await retailClient.removeFulfillmentPlaces(request);
    await operation.promise();
  };

  // Remove fulfillment places
  console.log('Start remove fulfillment');
  await callRemoveFulfillmentPlaces();

  //Get product
  const response = await utils.getProduct(product);
  console.log(
    'Updated product with current time: ',
    JSON.stringify(response[0])
  );
  console.log('Remove fulfillment finished');

  // Delete product
  await utils.deleteProduct(product);
  console.log(`Product ${createdProduct.id} deleted`);
}

process.on('unhandledRejection', err => {
  console.error('ERROR', err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
