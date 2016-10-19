/**
 * Copyright 2016, Google, Inc.
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

const proxyquire = require(`proxyquire`).noPreserveCache();
const bigquery = proxyquire(`@google-cloud/bigquery`, {})();
var uuid = require('node-uuid');

const expectedDatasetId = `my_new_dataset`;
let datasetId = `nodejs-docs-samples-test-${uuid.v4()}`;
datasetId = datasetId.replace(/-/gi, `_`);

describe(`bigquery:quickstart`, () => {
  let bigqueryMock, BigqueryMock;

  after((done) => {
    bigquery.dataset(datasetId).delete(() => {
      // Ignore any error, the dataset might not have been created
      done();
    });
  });

  it(`quickstart should create a dataset`, (done) => {
    bigqueryMock = {
      createDataset: (_datasetId) => {
        assert.equal(_datasetId, expectedDatasetId);

        return bigquery.createDataset(datasetId)
          .then((results) => {
            const dataset = results[0];
            assert.notEqual(dataset, undefined);
            setTimeout(() => {
              assert.equal(console.log.calledOnce, true);
              assert.deepEqual(console.log.firstCall.args, [`Dataset ${dataset.id} created.`]);
              done();
            }, 500);
            return results;
          }).catch(done);
      }
    };
    BigqueryMock = sinon.stub().returns(bigqueryMock);

    proxyquire(`../quickstart`, {
      '@google-cloud/bigquery': BigqueryMock
    });
  });
});
