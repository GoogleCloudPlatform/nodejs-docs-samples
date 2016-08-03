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

var loadDataFromGcsExample = require('../load_data_from_gcs');
var bucket = process.env.TEST_BUCKET_NAME || 'nodejs-docs-samples';
var file = 'data.csv';
var datasetId = 'nodejs_docs_samples';

describe('bigquery:load_data_from_gcs', function () {
  it('should be tested');

  it('should require correct arguments', function () {
    assert.throws(function () {
      loadDataFromGcsExample.main();
    }, Error, 'bucket is required!');
    assert.throws(function () {
      loadDataFromGcsExample.main(bucket);
    }, Error, 'file is required!');
    assert.throws(function () {
      loadDataFromGcsExample.main(bucket, file);
    }, Error, 'datasetId is required!');
    assert.throws(function () {
      loadDataFromGcsExample.main(bucket, file, datasetId);
    }, Error, 'tableName is required!');
  });
});
