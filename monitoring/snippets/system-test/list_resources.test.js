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

const listResourcesExample = require(`../list_resources`);

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should list a bunch of stuff`, (t) => {
  listResourcesExample.main(process.env.GCLOUD_PROJECT, (err, results) => {
    t.ifError(err);
    t.is(results.length, 3);
    // Monitored resources
    t.true(Array.isArray(results[0].resourceDescriptors));
    // Metric descriptors
    t.true(Array.isArray(results[1].metricDescriptors));
    // Time series
    t.true(Array.isArray(results[2].timeSeries));
    t.true(console.log.calledWith('Monitored resources'));
    t.true(console.log.calledWith('Metric descriptors'));
    t.true(console.log.calledWith('Time series'));
    t.end();
  });
});
