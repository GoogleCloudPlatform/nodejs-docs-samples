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

var test = require('ava');
var customMetricsExample = require('../../monitoring/create_custom_metric');

/** Refactored out to keep lines shorter */
function getPointValue (timeSeries) {
  return timeSeries.timeSeries[0].points[0].value.int64Value;
}

test.cb.serial('should create and read back a custom metric', function (t) {
  customMetricsExample.main(
    process.env.GCLOUD_PROJECT,
    Math.random().toString(36).substring(7),
    function (err, results) {
      t.ifError(err);
      // console.log('---------------------------------------------');
      // console.log(JSON.stringify(results, null, 2));
      // console.log('---------------------------------------------');
      t.is(results.length, 4);
      // Result of creating metric
      t.truthy(typeof results[0].name === 'string');
      // Result of writing time series
      t.deepEqual(results[1], {});
      // Result of reading time series
      t.truthy(typeof getPointValue(results[2]) === 'string');
      t.truthy(!isNaN(parseInt(getPointValue(results[2]), 10)));
      // Result of deleting metric
      t.deepEqual(results[3], {});
      t.end();
    }
  );
});
