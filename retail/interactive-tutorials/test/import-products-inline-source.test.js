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

const path = require('path');
const cp = require('child_process');
const {before, describe, it, after} = require('mocha');
const {ProductServiceClient} = require('@google-cloud/retail');
const {assert, expect} = require('chai');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

describe('Import product from inline source', () => {
  const retailClient = new ProductServiceClient();

  const id1 = Math.random().toString(36).slice(2).toUpperCase();
  const id2 = Math.random().toString(36).slice(2).toUpperCase();

  let projectId;
  let product1;
  let product2;
  let stdout;

  before(async () => {
    projectId = await retailClient.getProjectId();
    product1 = {
      id: id1,
      name: `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch/products/${id1}`,
    };

    product2 = {
      id: id2,
      name: `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch/products/${id2}`,
    };

    stdout = execSync(
      `node interactive-tutorials/product/import-products-inline-source.js ${product1.id} ${product2.id}`,
      {cwd}
    );
  });

  it('should check that import started', () => {
    assert.match(stdout, /Start import products/);
  });

  it('should check that products imported correctly', async () => {
    const regex = new RegExp('Operation result: .*\\n', 'g');
    assert.match(stdout, regex);
    const string = stdout
      .match(regex)
      .toString()
      .replace('Operation result: ', '');
    const importOperation = JSON.parse(string);

    expect(importOperation).to.be.an('array');
    expect(importOperation.length).to.equal(3);

    const response = importOperation[1];
    const metadata = importOperation[2];

    expect(metadata).to.be.an('object');
    expect(metadata.done).to.be.true;

    expect(response).to.be.an('object');
    expect(response.successCount).to.equal('2');
  });

  it('should check that import finished', () => {
    assert.match(stdout, /Import products finished/);
  });

  it('should check that product deleted', async () => {
    const regex = new RegExp('Products deleted', 'g');
    assert.match(stdout, regex);
  });

  after(async () => {
    try {
      const importedProduct1 = await retailClient.getProduct({
        name: product1.name,
      });
      const importedProduct2 = await retailClient.getProduct({
        name: product2.name,
      });
      expect(importedProduct1, 'The product not deleted').to.be.undefined;
      expect(importedProduct2, 'The product not deleted').to.be.undefined;
    } catch (err) {
      expect(err, 'Bad error code').to.include({code: 5});
    }
  });
});
