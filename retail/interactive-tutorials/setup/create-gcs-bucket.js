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

async function main(generatedBucketName) {
  const utils = require('./setup-cleanup');

  // Instantiates a client.
  const {ProductServiceClient} = require('@google-cloud/retail').v2;
  const retailClient = new ProductServiceClient();

  const projectId = await retailClient.getProjectId();

  // The ID of your GCS bucket
  const bucketName = generatedBucketName
    ? generatedBucketName
    : `${projectId}_${Math.round(Date.now() / 1000)}`;

  //Creates the new bucket
  await utils.createBucket(bucketName);

  //Upload files
  await utils.uploadFile(
    bucketName,
    'interactive-tutorials/resources/products.json',
    'products.json'
  );
  await utils.uploadFile(
    bucketName,
    'interactive-tutorials/resources/products_some_invalid.json',
    'products_some_invalid.json'
  );
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
