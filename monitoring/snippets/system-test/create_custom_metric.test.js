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

require(`../../system-test/_setup`);

const customMetricsExample = require('../create_custom_metric');

/** Refactored out to keep lines shorter */
function getPointValue (timeSeries) {
  return timeSeries.timeSeries[0].points[0].value.int64Value;
}

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb('should create and read back a custom metric', (t) => {
  customMetricsExample.main(
    process.env.GCLOUD_PROJECT,
    Math.random().toString(36).substring(7),
    (err, results) => {
      t.ifError(err);
      t.is(results.length, 4);
      // Result of creating metric
      t.is(typeof results[0].name, 'string');
      // Result of writing time series
      t.deepEqual(results[1], {});
      // Result of reading time series
      t.is(typeof getPointValue(results[2]), 'string');
      t.false(isNaN(parseInt(getPointValue(results[2]), 10)));
      // Result of deleting metric
      t.deepEqual(results[3], {});
      t.true(console.log.calledWith('Created custom metric'));
      t.true(console.log.calledWith('Wrote time series'));
      t.true(console.log.calledWith('Reading metric type'));
      t.true(console.log.calledWith('Time series'));
      t.true(console.log.calledWith('Deleted metric'));
      t.end();
    }
  );
});
