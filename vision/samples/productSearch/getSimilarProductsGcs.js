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

function main() {
  // [START vision_product_search_get_similar_products_gcs]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');
  // Creates a client
  const productSearchClient = new vision.ProductSearchClient();
  const imageAnnotatorClient = new vision.ImageAnnotatorClient();

  async function getSimilarProductsGcs(
    projectId,
    location,
    productSetId,
    productCategory,
    filePath,
    filter
  ) {
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
  getSimilarProductsGcs();
  // [END vision_product_search_get_similar_products_gcs]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
