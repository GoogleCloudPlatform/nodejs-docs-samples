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
  // [START vision_product_search_get_product_set]
  async function getProductSet() {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ProductSearchClient();

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const productSetId = 'Id of the product set';

    // Resource path that represents Google Cloud Platform location.
    const productSetPath = client.productSetPath(
      projectId,
      location,
      productSetId
    );

    const [productSet] = await client.getProductSet({name: productSetPath});
    console.log(`Product Set name: ${productSet.name}`);
    console.log(`Product Set display name: ${productSet.displayName}`);
  }
  // [END vision_product_search_get_product_set]
  getProductSet();
}
main(...process.argv.slice(2));
