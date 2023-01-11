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

async function main() {
  const {ProductServiceClient} = require('@google-cloud/retail').v2;
  const utils = require('../setup/setup-cleanup');

  const retailClient = new ProductServiceClient();
  const projectId = await retailClient.getProjectId();

  const productsBucketName = process.env['BUCKET_NAME'];
  const eventsBucketName = process.env['EVENTS_BUCKET_NAME'];

  const productsDataset = 'products';
  const eventsDataset = 'user_events';

  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch`;

  await utils.deleteBucket(productsBucketName);
  await utils.deleteBucket(eventsBucketName);

  await utils.deleteProductsAll(parent);

  await utils.deleteBqDataset(productsDataset);
  await utils.deleteBqDataset(eventsDataset);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();
