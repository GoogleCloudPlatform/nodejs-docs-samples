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

var path = require('path');
var loadDataFromCsvExample = require('../load_data_from_csv');
var pathToCsvFile = path.join(__dirname, '/../resources/data.csv');
var datasetId = 'nodejs_docs_samples';

describe('bigquery:load_data_from_csv', function () {
  it('should be tested');

  it('should require correct arguments', function () {
    assert.throws(function () {
      loadDataFromCsvExample.main();
    }, Error, 'pathToCsvFile is required!');
    assert.throws(function () {
      loadDataFromCsvExample.main(pathToCsvFile);
    }, Error, 'datasetId is required!');
    assert.throws(function () {
      loadDataFromCsvExample.main(pathToCsvFile, datasetId);
    }, Error, 'tableName is required!');
  });
});
