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
  const product = await utils.createProduct(projectId, generatedProductId);

  // Full resource name of Product
  const name = product.name;

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

  // Get product
  console.log('Start product get operation');
  const foundProduct = await callGetProduct();
  console.log(`Product ${foundProduct.id} get operation finished`);

  // Delete product
  await utils.deleteProduct(name);
  console.log(`Product ${foundProduct.id} deleted`);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
