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

function main(projectId, location, productId, referenceImageId, gcsUri) {
  // [START vision_product_search_create_reference_image]
  const vision = require('@google-cloud/vision');

  const client = new vision.ProductSearchClient();

  async function createReferenceImage() {
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const productId = 'Id of the product';
    // const referenceImageId = 'Id of the reference image';
    // const gcsUri = 'Google Cloud Storage path of the input image';

    const formattedParent = client.productPath(projectId, location, productId);

    const referenceImage = {
      uri: gcsUri,
    };

    const request = {
      parent: formattedParent,
      referenceImage: referenceImage,
      referenceImageId: referenceImageId,
    };

    const [response] = await client.createReferenceImage(request);
    console.log(`response.name: ${response.name}`);
    console.log(`response.uri: ${response.uri}`);
  }
  createReferenceImage();
  // [END vision_product_search_create_reference_image]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
