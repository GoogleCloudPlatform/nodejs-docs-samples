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
const {before, describe, it} = require('mocha');
const {SearchServiceClient} = require('@google-cloud/retail');
const {assert, expect} = require('chai');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Search with filtering', () => {
  describe('Search with filtering run sample', () => {
    let stdout;

    before(async () => {
      stdout = execSync(
        'node interactive-tutorials/search/search-with-filtering.js',
        {cwd}
      );
    });

    it('should show that search successfully started', () => {
      assert.match(stdout, /Search start/);
    });

    it('should show that search successfully finished', () => {
      assert.match(stdout, /Search end/);
    });
  });

  describe('Search with filtering sample result', () => {
    const retailClient = new SearchServiceClient();
    let projectId;
    let request;
    const IResponseParams = {
      ISearchResult: 0,
      ISearchRequest: 1,
      ISearchResponse: 2,
    };
    let response = [];

    before(async () => {
      projectId = await retailClient.getProjectId();
      request = {
        placement: `projects/${projectId}/locations/global/catalogs/default_catalog/placements/default_search`,
        query: 'Tee',
        visitorId: '12345',
        filter: '(colorFamilies: ANY("Black"))',
      };
      response = await retailClient.search(request, {autoPaginate: false});
    });

    it('should be a valid response', () => {
      expect(response).to.be.an('array');
      expect(response.length).to.equal(3);
      const searchResult = response[IResponseParams.ISearchResult];
      const searchResponse = response[IResponseParams.ISearchResponse];
      if (searchResult.length) {
        expect(searchResponse.totalSize).to.be.above(0);
        searchResult.forEach(resultItem => {
          expect(resultItem, 'It should be an object').to.be.an('object');
          expect(
            resultItem,
            'The object has no  valid properties'
          ).to.have.all.keys(
            'matchingVariantFields',
            'variantRollupValues',
            'id',
            'product',
            'personalLabels',
            'matchingVariantCount'
          );
        });
      } else {
        expect(searchResult).to.be.an('array').that.is.empty;
        expect(searchResponse.totalSize).to.equal(0);
      }
    });

    it('should contain filtered values', () => {
      const searchResult = response[IResponseParams.ISearchResult];
      if (searchResult.length) {
        searchResult.forEach(item => {
          expect(
            item.product,
            'Object has no "colorInfo" property'
          ).to.have.property('colorInfo');
          expect(
            item.product.colorInfo,
            'Object has no "colorFamilies" array'
          ).to.have.property('colorFamilies');
          expect(
            item.product.colorInfo.colorFamilies,
            '"colorFamilies" field does not containt filter condition value'
          )
            .to.be.an('array')
            .that.includes('Black');
        });
      } else {
        expect(searchResult).to.be.an('array').that.is.empty;
      }
    });
  });
});
