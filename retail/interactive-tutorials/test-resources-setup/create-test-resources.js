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

async function main() {
  const {ProductServiceClient} = require('@google-cloud/retail').v2;
  const utils = require('../setup/setup-cleanup');

  const retailClient = new ProductServiceClient();
  const projectId = await retailClient.getProjectId();

  const productsBucketName = process.env['BUCKET_NAME'];
  const eventsBucketName = process.env['EVENTS_BUCKET_NAME'];

  const gcsBucket = `gs://${productsBucketName}`;
  const gcsErrorsBucket = `gs://${productsBucketName}/error`;
  const gcsProductsObject = 'products.json';

  const productsDataset = 'products';
  const productTable = 'products';
  const productSchema = 'interactive-tutorials/resources/product_schema.json';
  const eventsDataset = 'user_events';
  const eventsTable = 'events';
  const eventsSchema = 'interactive-tutorials/resources/events_schema.json';

  const productsSourceFile = 'interactive-tutorials/resources/products.json';
  const eventsSourceFile = 'interactive-tutorials/resources/user_events.json';

  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch`;

  const inputConfig = {
    gcsSource: {
      inputUris: [gcsBucket + '/' + gcsProductsObject],
      dataSchema: 'product',
    },
  };

  const errorsConfig = {
    gcsPrefix: gcsErrorsBucket,
  };

  const IResponseParams = {
    IImportProductsResponse: 0,
    IImportMetadata: 1,
    IOperation: 2,
  };

  const importProducts = async () => {
    // Construct request
    const request = {
      parent,
      inputConfig,
      errorsConfig,
    };
    console.log('Import products request:', request);

    // Run request
    const [operation] = await retailClient.importProducts(request);
    const response = await operation.promise();
    const result = response[IResponseParams.IImportMetadata];
    console.log(
      `Number of successfully imported products: ${result.successCount | 0}`
    );
    console.log(
      `Number of failures during the importing: ${result.failureCount | 0}`
    );
    console.log(`Operation result: ${JSON.stringify(response)}`);
  };

  // Create a GCS bucket with products.json file
  await utils.createBucket(productsBucketName);
  await utils.uploadFile(
    productsBucketName,
    productsSourceFile,
    'products.json'
  );

  // Create a GCS bucket with user_events.json file
  await utils.createBucket(eventsBucketName);
  await utils.uploadFile(
    eventsBucketName,
    eventsSourceFile,
    'user_events.json'
  );

  // Import prodcuts from the GCS bucket to the Retail catalog
  await importProducts();

  // Create a BigQuery table with products
  await utils.createBqDataset(productsDataset);
  await utils.createBqTable(productsDataset, productTable, productSchema);
  await utils.uploadDataToBqTable(
    productsDataset,
    productTable,
    productsSourceFile,
    productSchema
  );

  // Create a BigQuery table with user events
  await utils.createBqDataset(eventsDataset);
  await utils.createBqTable(eventsDataset, eventsTable, eventsSchema);
  await utils.uploadDataToBqTable(
    eventsDataset,
    eventsTable,
    eventsSourceFile,
    eventsSchema
  );
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();
