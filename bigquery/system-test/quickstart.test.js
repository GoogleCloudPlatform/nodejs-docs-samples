// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var proxyquire = require('proxyquire').noPreserveCache();
var bigquery = proxyquire('@google-cloud/bigquery', {})();

var datasetName = 'my_new_dataset';

describe('bigquery:quickstart', function () {
  var bigqueryMock, BigqueryMock;

  after(function (done) {
    bigquery.dataset(datasetName).delete(function () {
      // Ignore any error, the dataset might not have been created
      done();
    });
  });

  it('should create a dataset', function (done) {
    bigqueryMock = {
      createDataset: function (_datasetName) {
        assert.equal(_datasetName, datasetName);

        bigquery.createDataset(datasetName, function (err, dataset, apiResponse) {
          assert.ifError(err);
          assert.notEqual(dataset, undefined);
          assert.notEqual(apiResponse, undefined);
          done();
        });
      }
    };
    BigqueryMock = sinon.stub().returns(bigqueryMock);

    proxyquire('../quickstart', {
      '@google-cloud/bigquery': BigqueryMock
    });
  });
});
