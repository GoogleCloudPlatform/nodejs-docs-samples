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

var uuid = require('node-uuid');
var bucketsExample = require('../buckets');
var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();

describe('storage:buckets', function () {
  describe('create', function () {
    it('should create a bucket', function (done) {
      bucketsExample.createBucket(bucketName, function (err, bucket) {
        assert.ifError(err);
        assert.equal(bucket.name, bucketName);
        assert(console.log.calledWith('Created bucket: %s', bucketName));
        setTimeout(done, 2000);
      });
    });
  });
  describe('list', function () {
    it('should list buckets', function (done) {
      bucketsExample.listBuckets(function (err, buckets) {
        assert.ifError(err);
        assert(Array.isArray(buckets));
        assert(buckets.length > 0);
        assert(console.log.calledWith('Found %d buckets!', buckets.length));
        setTimeout(done, 2000);
      });
    });
  });
  describe('delete', function () {
    it('should delete a bucket', function (done) {
      bucketsExample.deleteBucket(bucketName, function (err, apiResponse) {
        assert.ifError(err);
        assert(console.log.calledWith('Deleted bucket: %s', bucketName));
        done();
      });
    });
  });
});
