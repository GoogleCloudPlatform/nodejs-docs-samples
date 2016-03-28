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
var listExample = require('../../logging/list');

test.cb('should list entries', function (t) {
  listExample.main(undefined, function (err, entries, nextQuery, apiResponse) {
    t.ifError(err);
    t.ok(entries, 'should have received entries');
    t.ok(Array.isArray(entries), 'entries should be an array');
    t.ok(nextQuery, 'should have received nextQuery');
    t.ok(apiResponse, 'should have received apiResponse');
    t.end();
  });
});
