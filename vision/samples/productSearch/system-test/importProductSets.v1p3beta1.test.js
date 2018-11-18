/**
 * Copyright 2018, Google, LLC.
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

const path = require(`path`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);
const cmd = `node importProductSets.v1p3beta1.js`;
const cwd = path.join(__dirname, `..`);

//Shared fixture data for product tests
const testImportProductSets = {
  projectId: process.env.GCLOUD_PROJECT,
  location: 'us-west1',
  gcsUri: 'gs://nodejs-docs-samples/product-search/product_sets.csv',
};

describe(`import product sets`, () => {
  it(`Should import a Product Set`, async () => {
    const output = await tools.runAsync(
      `${cmd} importProductSets "${testImportProductSets.projectId}" "${
        testImportProductSets.location
      }" "${testImportProductSets.gcsUri}"`,
      cwd
    );
    assert.ok(output.includes(`Processing done.`));
  });
});
