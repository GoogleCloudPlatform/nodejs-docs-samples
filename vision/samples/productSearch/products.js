/**
 * Copyright 2018 Google LLC
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

async function createProduct(
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
  // [END vision_product_search_create_product]
}

async function getProduct(projectId, location, productId) {
  // [START vision_product_search_get_product]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productId = 'Id of the product';

  // Resource path that represents Google Cloud Platform location.
  const productPath = client.productPath(projectId, location, productId);

  const [product] = await client.getProduct({name: productPath});
  console.log(`Product name: ${product.name}`);
  console.log(`Product id: ${product.name.split('/').pop()}`);
  console.log(`Product display name: ${product.displayName}`);
  console.log(`Product description: ${product.description}`);
  console.log(`Product category: ${product.productCategory}`);
  console.log(`Product labels: ${product.productLabels}`);
  // [END vision_product_search_get_product]
}

async function listProducts(projectId, location) {
  // [START vision_product_search_list_products]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';

  // Resource path that represents Google Cloud Platform location.
  const locationPath = client.locationPath(projectId, location);

  const [products] = await client.listProducts({parent: locationPath});
  products.forEach(product => {
    console.log(`Product name: ${product.name}`);
    console.log(`Product id: ${product.name.split('/').pop()}`);
    console.log(`Product display name: ${product.displayName}`);
    console.log(`Product description: ${product.description}`);
    console.log(`Product category: ${product.productCategory}`);
    if (product.productLabels.length) {
      console.log(`Product labels:`);
      product.productLabels.forEach(productLabel => {
        console.log(`${productLabel.key}: ${productLabel.value}`);
      });
    }
  });
  // [END vision_product_search_list_products]
}

async function deleteProduct(projectId, location, productId) {
  // [START vision_product_search_delete_product]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productId = 'Id of the product';

  // Resource path that represents full path to the product.
  const productPath = client.productPath(projectId, location, productId);

  await client.deleteProduct({name: productPath});
  console.log('Product deleted.');
  // [END vision_product_search_delete_product]
}

async function updateProductLabels(projectId, location, productId, key, value) {
  // [START vision_product_search_update_product_labels]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

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
  // [END vision_product_search_update_product_labels]
}

// [START vision_product_search_purge_orphan_products]
async function purgeOrphanProducts(projectId, location) {
  // Deletes all products not in any product sets.

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

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
// [END vision_product_search_purge_orphan_products]

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `createProduct <projectId> <location> <productId> <productDisplayName> <productCategory>`,
    `Create product`,
    {},
    opts =>
      createProduct(
        opts.projectId,
        opts.location,
        opts.productId,
        opts.productDisplayName,
        opts.productCategory
      )
  )
  .command(
    `getProduct <projectId> <location> <productId>`,
    `Get product`,
    {},
    opts => getProduct(opts.projectId, opts.location, opts.productId)
  )
  .command(`listProducts <projectId> <location>`, `List products`, {}, opts =>
    listProducts(opts.projectId, opts.location)
  )
  .command(
    `purgeOrphanProducts <projectId> <location>`,
    `Delete all products not in any product sets.`,
    {},
    opts => purgeOrphanProducts(opts.projectId, opts.location)
  )
  .command(
    `deleteProduct <projectId> <location> <productId>`,
    `Delete product`,
    {},
    opts => deleteProduct(opts.projectId, opts.location, opts.productId)
  )
  .command(
    `updateProductLabels <projectId> <location> <productId> <key> <value>`,
    `Update product label`,
    {},
    opts =>
      updateProductLabels(
        opts.projectId,
        opts.location,
        opts.productId,
        opts.key,
        opts.value
      )
  )
  .example(`node $0 COMMAND ARG`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict().argv;
