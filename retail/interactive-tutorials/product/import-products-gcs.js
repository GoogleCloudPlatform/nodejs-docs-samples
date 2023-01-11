// Copyright 2022 Google Inc. All Rights Reserved.
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

async function main(bucketName) {
  // Imports the Google Cloud client library.
  const {ProductServiceClient} = require('@google-cloud/retail').v2;

  // Instantiates a client.
  const retailClient = new ProductServiceClient();

  const projectId = await retailClient.getProjectId();

  const gcsBucket = `gs://${bucketName}`;
  const gcsErrorsBucket = `gs://${bucketName}/error`;
  const gcsProductsObject = 'products.json'; // TO CHECK ERROR HANDLING USE THE JSON WITH INVALID PRODUCT

  // Placement
  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch`; //TO CHECK ERROR HANDLING PASTE THE INVALID CATALOG NAME HERE

  // The desired input location of the data.
  const inputConfig = {
    gcsSource: {
      inputUris: [gcsBucket + '/' + gcsProductsObject],
      dataSchema: 'product',
    },
  };

  // The desired location of errors incurred during the Import.
  const errorsConfig = {
    gcsPrefix: gcsErrorsBucket,
  };

  const IResponseParams = {
    IImportProductsResponse: 0,
    IImportMetadata: 1,
    IOperation: 2,
  };

  const callImportProducts = async () => {
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
  console.log('Start import products');
  await callImportProducts();
  console.log('Import products finished');
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(
  ...(() => {
    const argv = process.argv.slice(2);
    return argv.length ? argv : [process.env['BUCKET_NAME']];
  })()
);
