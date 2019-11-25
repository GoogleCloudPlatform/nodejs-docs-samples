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

async function createReferenceImage(
  projectId,
  location,
  productId,
  referenceImageId,
  gcsUri
) {
  // [START vision_product_search_create_reference_image]

  const vision = require('@google-cloud/vision');

  const client = new vision.ProductSearchClient();

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
  // [END vision_product_search_create_reference_image]
}

async function listReferenceImage(projectId, location, productId) {
  // [START vision_product_search_list_reference_images]

  const vision = require('@google-cloud/vision');

  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';

  // const formattedParent = client.productPath(projectId, location, productId);
  // const location = 'A compute region name';
  // const productId = 'Id of the product';
  const formattedParent = client.productPath(projectId, location, productId);
  const request = {
    parent: formattedParent,
  };

  const [response] = await client.listReferenceImages(request);
  response.forEach(image => {
    console.log(`image.name: ${image.name}`);
    console.log(`image.uri: ${image.uri}`);
  });
  // [END vision_product_search_list_reference_images]
}

async function getReferenceImage(
  projectId,
  location,
  productId,
  referenceImageId
) {
  // [START vision_product_search_get_reference_image]

  const vision = require('@google-cloud/vision');

  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productId = 'Id of the product';
  // const referenceImageId = 'Id of the reference image';

  const formattedName = client.referenceImagePath(
    projectId,
    location,
    productId,
    referenceImageId
  );

  const request = {
    name: formattedName,
  };

  const response = await client.getReferenceImage(request);
  console.log(`response.name: ${response.name}`);
  console.log(`response.uri: ${response.uri}`);
  // [END vision_product_search_get_reference_image]
}

async function deleteReferenceImage(
  projectId,
  location,
  productId,
  referenceImageId
) {
  // [START vision_product_search_delete_reference_image]

  const vision = require('@google-cloud/vision');

  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = 'Your Google Cloud project Id';
  // const location = 'A compute region name';
  // const productId = 'Id of the product';
  // const referenceImageId = 'Id of the reference image';

  const formattedName = client.referenceImagePath(
    projectId,
    location,
    productId,
    referenceImageId
  );

  const request = {
    name: formattedName,
  };

  await client.deleteReferenceImage(request);
  console.log(`Reference image deleted from product.`);
  // [END vision_product_search_delete_reference_image]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `createReferenceImage <projectId> <location> <productId> <referenceImageId> <gcsUri>`,
    `Create Reference Image`,
    {},
    opts =>
      createReferenceImage(
        opts.projectId,
        opts.location,
        opts.productId,
        opts.referenceImageId,
        opts.gcsUri
      )
  )
  .command(
    `listReferenceImages <projectId> <location> <productId>`,
    `List Reference Images`,
    {},
    opts => listReferenceImage(opts.projectId, opts.location, opts.productId)
  )
  .command(
    `getReferenceImage <projectId> <location> <productId> <referenceImageId>`,
    `Get Reference Image`,
    {},
    opts =>
      getReferenceImage(
        opts.projectId,
        opts.location,
        opts.productId,
        opts.referenceImageId
      )
  )
  .command(
    `deleteReferenceImage <projectId> <location> <productId> <referenceImageId>`,
    `Delete Reference Image`,
    {},
    opts =>
      deleteReferenceImage(
        opts.projectId,
        opts.location,
        opts.productId,
        opts.referenceImageId
      )
  )
  .example(`node $0 COMMAND ARG`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict().argv;
