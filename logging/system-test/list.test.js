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

var listExample = require('../list');

describe('logging:list', function () {
  it('should list entries', function (done) {
    listExample.main(undefined, function (err, entries, nextQuery, apiResponse) {
      assert.ifError(err);
      assert(entries, 'should have received entries');
      assert(Array.isArray(entries), 'entries should be an array');
      assert(nextQuery, 'should have received nextQuery');
      assert(apiResponse, 'should have received apiResponse');
      done();
    });
  });
});
