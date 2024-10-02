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
  const utils = require('./setup-cleanup');

  const dataset = 'products';
  const validTable = 'products';
  const invalidTable = 'products_some_invalid';
  const schema = 'interactive-tutorials/resources/product_schema.json';
  const validSourceFile = 'interactive-tutorials/resources/products.json';
  const invalidSourceFile =
    'interactive-tutorials/resources/products_some_invalid.json';

  await utils.createBqDataset(dataset);
  await utils.createBqTable(dataset, validTable, schema);
  await utils.uploadDataToBqTable(dataset, validTable, validSourceFile, schema);

  await utils.createBqTable(dataset, invalidTable, schema);
  await utils.uploadDataToBqTable(
    dataset,
    invalidTable,
    invalidSourceFile,
    schema
  );
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();
