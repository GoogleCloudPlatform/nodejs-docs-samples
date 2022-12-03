// Copyright 2020 Google LLC
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

function main(
  projectId,
  location,
  productId,
  productDisplayName,
  productCategory
) {
  // [START vision_product_search_create_product]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();
  async function createProduct() {
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const productId = 'Id of the product';
    // const productDisplayName = 'Display name of the product';
    // const productCategory = 'Catoegory of the product';

    // Resource path that represents Google Cloud Platform location.
    const locationPath = client.locationPath(projectId, location);

    const product = {
      displayName: productDisplayName,
      productCategory: productCategory,
    };

    const request = {
      parent: locationPath,
      product: product,
      productId: productId,
    };

    const [createdProduct] = await client.createProduct(request);
    console.log(`Product name: ${createdProduct.name}`);
  }
  createProduct();
  // [END vision_product_search_create_product]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
