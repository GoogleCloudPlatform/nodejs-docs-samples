// Copyright 2016, Google, Inc.
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

var async = require('async');
var loadDataFromCsvExample = require('../load_data_from_csv');
var loadDataFromGcsExample = require('../load_data_from_gcs');
var bucket = process.env.TEST_BUCKET_NAME || 'nodejs-docs-samples';
var file = 'data.csv';
var datasetId = 'nodejs_docs_samples';
var tableName = 'test_' + new Date().getTime() + '_' +
  Math.floor(Math.random() * 10000);

describe('bigquery:load_data_from_gcs', function () {
  it('should load data from a csv file in a GCS bucket', function (done) {
    async.series([
      function (cb) {
        loadDataFromCsvExample.createTable(datasetId, tableName, cb);
      },
      function (cb) {
        loadDataFromGcsExample.main(bucket, file, datasetId, tableName, cb);
      },
      function (cb) {
        loadDataFromCsvExample.deleteTable(datasetId, tableName, cb);
      }
    ], function (err, results) {
      if (err) {
        loadDataFromCsvExample.deleteTable(datasetId, tableName, function () {
          done(err);
        });
      } else {
        assert.ifError(err);
        // metadata
        assert.equal(results[1].status.state, 'DONE');
        done();
      }
    });
  });
});
