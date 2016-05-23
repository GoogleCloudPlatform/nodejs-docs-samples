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
var iamSample = require('../../pubsub/iam');

test.cb('should run the sample', function (t) {
  iamSample.main(function (err, results) {
    t.ifError(err);
    t.is(results.length, 8);
    // Got topic and apiResponse
    t.is(results[0].length, 2);
    // Got policy and apiResponse
    t.is(results[1].length, 2);
    // Got permissions and apiResponse
    t.is(results[2].length, 2);
    // Got subscription and apiResponse
    t.is(results[3].length, 2);
    // Got policy and apiResponse
    t.is(results[4].length, 2);
    // Got permissions and apiResponse
    t.is(results[5].length, 2);
    // Got empty apiResponse
    t.deepEqual(results[6], {});
    // Got empty apiResponse
    t.deepEqual(results[7], {});
    t.end();
  });
});
