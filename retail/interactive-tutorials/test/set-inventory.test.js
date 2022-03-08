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

describe('Set inventory', () => {
  const retailClient = new ProductServiceClient();
  const productId = Math.random().toString(36).slice(2).toUpperCase();
  const projectNumber = process.env['GCLOUD_PROJECT'];
  const name = `projects/${projectNumber}/locations/global/catalogs/default_catalog/branches/default_branch/products/${productId}`;
  const product = {
    priceInfo: {
      price: 15.0,
      originalPrice: 20.0,
      cost: 8.0,
      currencyCode: 'USD',
    },
    fulfillmentInfo: [
      {
        type: 'same-day-delivery',
        placeIds: ['store3', 'store4'],
      },
    ],
    availableQuantity: {
      value: 2,
    },
    availability: 'IN_STOCK',
  };
  let stdout;

  before(async () => {
    stdout = execSync(
      `node interactive-tutorials/product/set-inventory.js ${productId}`,
      {cwd}
    );
  });

  it('should check that product created', () => {
    const regex = new RegExp(`Product ${productId} created`, 'g');
    assert.match(stdout, regex);
  });

  it('should check that set inventory started', () => {
    assert.match(stdout, /Start set inventory/);
  });

  it('should check that set inventory finished', () => {
    assert.match(stdout, /Set inventory finished/);
  });

  const checkUpdatedProduct = updatedProduct => {
    expect(updatedProduct).to.be.an('object');
    assert.containsAllDeepKeys(updatedProduct, product);
    expect(updatedProduct.priceInfo.price, 'Price not equal').to.equal(15.0);
    expect(
      updatedProduct.priceInfo.originalPrice,
      'Original price not equal'
    ).to.equal(20.0);
    expect(updatedProduct.priceInfo.cost, 'Cost not equal').to.equal(8.0);
    expect(
      updatedProduct.priceInfo.currencyCode,
      'Currency code not equal'
    ).to.equal('USD');
    expect(updatedProduct.fulfillmentInfo).to.be.an('array');
    expect(
      updatedProduct.fulfillmentInfo.length,
      'Fulfillment array is empty'
    ).to.equal(1);

    const fulfillmentItem = updatedProduct.fulfillmentInfo[0];
    expect(fulfillmentItem).to.be.an('object');
    expect(fulfillmentItem).to.have.all.keys('type', 'placeIds');
    expect(fulfillmentItem.type).to.equal('same-day-delivery');
    expect(fulfillmentItem.placeIds)
      .to.be.an('array')
      .that.includes('store3', 'store4');

    expect(
      updatedProduct.availableQuantity,
      'Available quantity not equal'
    ).to.deep.equal({value: 2});
    expect(updatedProduct.availability, 'Availability not equal').to.equal(
      'IN_STOCK'
    );
  };

  it('should check that product updated correctly', async () => {
    const regex = new RegExp(
      `Updated product ${productId} with current time: .*\\n`,
      'g'
    );
    assert.match(stdout, regex);
    const string = stdout
      .match(regex)
      .toString()
      .replace(`Updated product ${productId} with current time: `, '');
    const updatedProduct = JSON.parse(string);

    checkUpdatedProduct(updatedProduct);
  });

  it('should check that product has not been updated with outdated time', async () => {
    const regex = new RegExp(
      `Updated product ${productId} with outdated time: .*\\n`,
      'g'
    );
    assert.match(stdout, regex);
    const string = stdout
      .match(regex)
      .toString()
      .replace(`Updated product ${productId} with outdated time: `, '');
    const updatedProduct = JSON.parse(string);

    checkUpdatedProduct(updatedProduct);
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
