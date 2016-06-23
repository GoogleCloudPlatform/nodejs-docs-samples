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
var path = require('path');
var test = require('ava');
var loadDataFromCsvExample = require('../../bigquery/load_data_from_csv');
var pathToCsvFile = path.join(__dirname, '/../../bigquery/resources/data.csv');
var datasetId = 'nodejs_docs_samples';
var tableName = 'test_' + new Date().getTime() + '_' +
  Math.floor(Math.random() * 10000);

test.cb.serial('should load data from a csv file', function (t) {
  async.series([
    function (cb) {
      loadDataFromCsvExample.createTable(datasetId, tableName, cb);
    },
    function (cb) {
      loadDataFromCsvExample.main(pathToCsvFile, datasetId, tableName, cb);
    },
    function (cb) {
      loadDataFromCsvExample.deleteTable(datasetId, tableName, cb);
    }
  ], function (err, results) {
    if (err) {
      loadDataFromCsvExample.deleteTable(datasetId, tableName, function () {
        t.end(err);
      });
    } else {
      t.ifError(err);
      // metadata
      t.is(results[1].status.state, 'DONE');
      t.end();
    }
  });
});

test('should require correct arguments', function (t) {
  t.throws(function () {
    loadDataFromCsvExample.main();
  }, Error, 'pathToCsvFile is required!');
  t.throws(function () {
    loadDataFromCsvExample.main(pathToCsvFile);
  }, Error, 'datasetId is required!');
  t.throws(function () {
    loadDataFromCsvExample.main(pathToCsvFile, datasetId);
  }, Error, 'tableName is required!');
});
