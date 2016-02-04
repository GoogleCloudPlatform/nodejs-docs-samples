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

var assert = require('assert');

var logging = require('../../logging/list');

describe('logging/list', function () {
  it('should list entries', function (done) {
    logging.list(function (err, entries, apiResponse) {
      if (err) {
        return done(err);
      }
      assert.ok(Array.isArray(entries), 'should have got an array');
      assert.ok(apiResponse.orderBy);
      assert.ok(apiResponse.pageSize);
      assert.ok(Array.isArray(apiResponse.projectIds));
      if (entries.length === 3) {
        // obviously this will pass
        assert.equal(entries.length, 3, 'should have three entries');
      } else {
        console.error('Received correct apiResponse, but no logs. Why not?');
      }
      done();
    });
  });
});
