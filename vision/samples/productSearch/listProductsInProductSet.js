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

function main(projectId, location, productSetId) {
  // [START vision_product_search_list_products_in_product_set]
  const vision = require('@google-cloud/vision');

  const client = new vision.ProductSearchClient();

  async function listProductsInProductSet() {
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const productSetId = 'Id of the product set';
    const productSetPath = client.productSetPath(
      projectId,
      location,
      productSetId
    );
    const request = {
      name: productSetPath,
    };

    const [products] = await client.listProductsInProductSet(request);
    products.forEach(product => {
      console.log(`Product name: ${product.name}`);
      console.log(`Product display name: ${product.displayName}`);
    });
  }
  listProductsInProductSet();
  // [END vision_product_search_list_products_in_product_set]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
