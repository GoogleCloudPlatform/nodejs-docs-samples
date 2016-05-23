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

var test = require('ava');
var datasetSizeExample = require('../../bigquery/dataset_size');

test.cb('should return the size of a dataset', function (t) {
  datasetSizeExample.main(
    'bigquery-public-data',
    'hacker_news',
    function (err, size) {
      t.ifError(err);
      t.is(typeof size, 'string');
      t.truthy(size.indexOf(' GB') === size.length - 3);
      t.end();
    }
  );
});
