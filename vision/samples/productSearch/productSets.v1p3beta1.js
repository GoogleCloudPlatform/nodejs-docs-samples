/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function createProductSet(
  projectId,
  location,
  productSetId,
  productSetDisplayName
) {
  // [START vision_product_search_create_product_set]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p3beta1;

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productSetId = 'Id of the product set';
  // const productSetDisplayName = 'Display name of the product set';

  // Resource path that represents Google Cloud Platform location.
  const locationPath = client.locationPath(projectId, location);

  const productSet = {
    displayName: productSetDisplayName,
  };

  const request = {
    parent: locationPath,
    productSet: productSet,
    productSetId: productSetId,
  };

  client
    .createProductSet(request)
    .then(results => {
      // The response is the product set with the `name` field populated
      const createdProductSet = results[0];
      console.log(`Product Set name: ${createdProductSet.name}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_product_search_create_product_set]
}

function getProductSet(projectId, location, productSetId) {
  // [START vision_product_search_get_product_set]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p3beta1;

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

  client
    .getProductSet({name: productSetPath})
    .then(results => {
      const productSet = results[0];
      console.log(`Product Set name: ${productSet.name}`);
      console.log(`Product Set display name: ${productSet.displayName}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_product_search_get_product_set]
}

function listProductSets(projectId, location) {
  // [START vision_product_search_list_product_sets]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p3beta1;

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';

  // Resource path that represents Google Cloud Platform location.
  const locationPath = client.locationPath(projectId, location);

  client
    .listProductSets({parent: locationPath})
    .then(results => {
      const productSets = results[0];
      productSets.forEach(productSet => {
        console.log(`Product Set name: ${productSet.name}`);
        console.log(`Product Set display name: ${productSet.displayName}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_product_search_list_product_sets]
}

function deleteProductSet(projectId, location, productSetId) {
  // [START vision_product_search_delete_product_set]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p3beta1;

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productSetId = 'Id of the product set';

  // Resource path that represents full path to the product set.
  const productSetPath = client.productSetPath(
    projectId,
    location,
    productSetId
  );

  client
    .deleteProductSet({name: productSetPath})
    .then(() => {
      console.log('Product set deleted.');
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_product_search_delete_product_set]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `createProductSet <projectId> <location> <productSetId> <productSetDisplayName>`,
    `Create product set`,
    {},
    opts =>
      createProductSet(
        opts.projectId,
        opts.location,
        opts.productSetId,
        opts.productSetDisplayName
      )
  )
  .command(
    `getProductSet <projectId> <location> <productSetId>`,
    `Get product set`,
    {},
    opts => getProductSet(opts.projectId, opts.location, opts.productSetId)
  )
  .command(
    `listProductSets <projectId> <location>`,
    `List product sets`,
    {},
    opts => listProductSets(opts.projectId, opts.location)
  )
  .command(
    `deleteProductSet <projectId> <location> <productSetId>`,
    `Delete product set`,
    {},
    opts => deleteProductSet(opts.projectId, opts.location, opts.productSetId)
  )
  .example(`node $0 COMMAND ARG`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict().argv;
