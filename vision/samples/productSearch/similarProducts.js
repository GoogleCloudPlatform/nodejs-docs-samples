// Copyright 2018 Google LLC
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
// [START vision_product_search_get_similar_products]
async function getSimilarProductsFile(
  projectId,
  location,
  productSetId,
  productCategory,
  filePath,
  filter
) {
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');
  const fs = require('fs');
  // Creates a client
  const productSearchClient = new vision.ProductSearchClient();
  const imageAnnotatorClient = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'nodejs-docs-samples';
  // const location = 'us-west1';
  // const productSetId = 'indexed_product_set_id_for_testing';
  // const productCategory = 'apparel';
  // const filePath = './resources/shoes_1.jpg';
  // const filter = '';
  const productSetPath = productSearchClient.productSetPath(
    projectId,
    location,
    productSetId
  );
  const content = fs.readFileSync(filePath, 'base64');
  const request = {
    // The input image can be a GCS link or HTTPS link or Raw image bytes.
    // Example:
    // To use GCS link replace with below code
    // image: {source: {gcsImageUri: filePath}}
    // To use HTTP link replace with below code
    // image: {source: {imageUri: filePath}}
    image: {content: content},
    features: [{type: 'PRODUCT_SEARCH'}],
    imageContext: {
      productSearchParams: {
        productSet: productSetPath,
        productCategories: [productCategory],
        filter: filter,
      },
    },
  };
  const [response] = await imageAnnotatorClient.batchAnnotateImages({
    requests: [request],
  });
  console.log('Search Image:', filePath);
  const results = response['responses'][0]['productSearchResults']['results'];
  console.log('\nSimilar product information:');
  results.forEach(result => {
    console.log('Product id:', result['product'].name.split('/').pop(-1));
    console.log('Product display name:', result['product'].displayName);
    console.log('Product description:', result['product'].description);
    console.log('Product category:', result['product'].productCategory);
  });
}
// [END vision_product_search_get_similar_products]

// [START vision_product_search_get_similar_products_gcs]
async function getSimilarProductsGcs(
  projectId,
  location,
  productSetId,
  productCategory,
  filePath,
  filter
) {
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');
  // Creates a client
  const productSearchClient = new vision.ProductSearchClient();
  const imageAnnotatorClient = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productSetId = 'Id of the product set';
  // const productCategory = 'Category of the product';
  // const filePath = 'Local file path of the image to be searched';
  // const filter = 'Condition to be applied on the labels';
  const productSetPath = productSearchClient.productSetPath(
    projectId,
    location,
    productSetId
  );

  const request = {
    // The input image can be a GCS link or HTTPS link or Raw image bytes.
    // Example:
    // To use GCS link replace with below code
    // image: {source: {gcsImageUri: filePath}}
    // To use HTTP link replace with below code
    // image: {source: {imageUri: filePath}}
    image: {source: {gcsImageUri: filePath}},
    features: [{type: 'PRODUCT_SEARCH'}],
    imageContext: {
      productSearchParams: {
        productSet: productSetPath,
        productCategories: [productCategory],
        filter: filter,
      },
    },
  };
  console.log(request.image);

  const [response] = await imageAnnotatorClient.batchAnnotateImages({
    requests: [request],
  });
  console.log('Search Image:', filePath);
  console.log('\nSimilar product information:');

  const results = response['responses'][0]['productSearchResults']['results'];
  results.forEach(result => {
    console.log('Product id:', result['product'].name.split('/').pop(-1));
    console.log('Product display name:', result['product'].displayName);
    console.log('Product description:', result['product'].description);
    console.log('Product category:', result['product'].productCategory);
  });
}
// [END vision_product_search_get_similar_products_gcs]
require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `getSimilarProductsFile <projectId> <location> <productSetId> <productCategory> <filePath> <filter>`,
    `Get similar products using local file`,
    {},
    opts =>
      getSimilarProductsFile(
        opts.projectId,
        opts.location,
        opts.productSetId,
        opts.productCategory,
        opts.filePath,
        opts.filter
      )
  )
  .command(
    `getSimilarProductsGcs <projectId> <location> <productSetId> <productCategory> <filePath> <filter>`,
    `Get similar products using GCS file`,
    {},
    opts =>
      getSimilarProductsGcs(
        opts.projectId,
        opts.location,
        opts.productSetId,
        opts.productCategory,
        opts.filePath,
        opts.filter
      )
  )
  .example(`node $0 COMMAND ARG`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict().argv;
