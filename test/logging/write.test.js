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

var logging = require('../../logging/write');

describe('logging/write', function () {
  it('should write entries', function (done) {
    logging.runExample(function (err, result) {
      if (err) {
        return done(err);
      }
      try {
        assert.equal(result.length, 2, 'should have two results');
        assert.deepEqual(result[0], {}, 'should have correct response');
        assert.deepEqual(result[1], {}, 'should have correct response');
        done();
      } catch (err) {
        return done(err);
      }
    });
  });
});
