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

function main(projectId, location) {
  // [START vision_product_search_purge_orphan_products]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  async function purgeOrphanProducts() {
    // Deletes all products not in any product sets.

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';

    const formattedParent = client.locationPath(projectId, location);

    // The operation is irreversible and removes multiple products.
    // The user is required to pass in force=true to actually perform the purge.
    // If force is not set to True, the service raises an error.
    const force = true;

    try {
      const [operation] = await client.purgeProducts({
        parent: formattedParent,
        deleteOrphanProducts: true,
        force: force,
      });
      await operation.promise();
      console.log('Orphan products deleted.');
    } catch (err) {
      console.log(err);
    }
  }
  purgeOrphanProducts();
  // [END vision_product_search_purge_orphan_products]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
