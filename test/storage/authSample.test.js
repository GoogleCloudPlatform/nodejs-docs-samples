// Copyright 2015, Google, Inc.
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

/**
 * @fileoverview Tests for the list-buckets module.
 */
'use strict';

var assert = require('assert');
var authSample = require('../../storage/authSample');
var projectId = process.env.TEST_PROJECT_ID || 'nodejs-docs-samples';

describe('listBuckets', function () {

  it('should return a list of buckets', function (done) {
    var bucketName = process.env.TEST_BUCKET_NAME || 'nodejs-docs-samples';

    authSample.listBuckets(
      projectId,
      function (err, response) {
        if (err) {
          return done(err);
        } else {
          assert(response.items.length > 0, 'There should be some buckets.');
          assert.equal(response.items.filter(function (item) {
            return item.name === bucketName;
          }).length, 1, 'There should be a bucket named ' + bucketName);
          return done();
        }
      }
    );
  });
});
