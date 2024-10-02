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

const path = require('path');
const cp = require('child_process');
const {before, describe, it, after} = require('mocha');
const {ProductServiceClient} = require('@google-cloud/retail');
const {assert, expect} = require('chai');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

describe('Create product', () => {
  const retailClient = new ProductServiceClient();
  const productId = Math.random().toString(36).slice(2).toUpperCase();
  let projectId;
  let name;
  let stdout;

  before(async () => {
    projectId = await retailClient.getProjectId();
    name = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch/products/${productId}`;

    stdout = execSync(
      `node interactive-tutorials/product/create-product.js ${productId}`,
      {cwd}
    );
  });

  it('should check that product creation started', () => {
    assert.match(stdout, /Start to create the product/);
  });

  it('should check that product created', () => {
    const regex = new RegExp(`Product ${productId} creation ended`, 'g');
    assert.match(stdout, regex);
  });

  it('should check that product deleted', async () => {
    const regex = new RegExp(`Product ${productId} deleted`, 'g');
    assert.match(stdout, regex);
  });

  after(async () => {
    try {
      const product = await retailClient.getProduct({name: name});
      expect(product, 'The product not deleted').to.be.undefined;
    } catch (err) {
      expect(err, 'Bad error code').to.include({code: 5});
    }
  });
});
