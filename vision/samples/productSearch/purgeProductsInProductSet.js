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
  // [START vision_product_search_purge_products_in_product_set]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  async function purgeProductsInProductSet() {
    // Deletes all products in a product set.

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const productSetId = 'Id of the product set';

    const formattedParent = client.locationPath(projectId, location);
    const purgeConfig = {productSetId: productSetId};

    // The operation is irreversible and removes multiple products.
    // The user is required to pass in force=true to actually perform the purge.
    // If force is not set to True, the service raises an error.
    const force = true;

    try {
      const [operation] = await client.purgeProducts({
        parent: formattedParent,
        productSetPurgeConfig: purgeConfig,
        force: force,
      });
      await operation.promise();
      console.log('Products removed from product set.');
    } catch (err) {
      console.log(err);
    }
  }
  purgeProductsInProductSet();
  // [END vision_product_search_purge_products_in_product_set]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
