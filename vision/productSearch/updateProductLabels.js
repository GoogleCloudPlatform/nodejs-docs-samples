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

function main(projectId, location, productId, key, value) {
  // [START vision_product_search_update_product_labels]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  async function updateProductLabels() {
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const productId = 'Id of the product';
    // const key = 'The key of the label';
    // const value = 'The value of the label';

    // Resource path that represents full path to the product.
    const productPath = client.productPath(projectId, location, productId);

    const product = {
      name: productPath,
      productLabels: [
        {
          key: key,
          value: value,
        },
      ],
    };

    const updateMask = {
      paths: ['product_labels'],
    };

    const request = {
      product: product,
      updateMask: updateMask,
    };

    const [updatedProduct] = await client.updateProduct(request);
    console.log(`Product name: ${updatedProduct.name}`);
    console.log(`Product display name: ${updatedProduct.displayName}`);
    console.log(`Product description: ${updatedProduct.description}`);
    console.log(`Product category: ${updatedProduct.productCategory}`);
    console.log(
      `Product Labels: ${updatedProduct.productLabels[0].key}: ${updatedProduct.productLabels[0].value}`
    );
  }
  updateProductLabels();
  // [END vision_product_search_update_product_labels]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
