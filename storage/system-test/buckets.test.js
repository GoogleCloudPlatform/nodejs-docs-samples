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

var bucketsExample = require('../buckets');
var bucketName = '' + new Date().getTime() + Math.floor(Math.random() * 100000000);

describe('storage:buckets', function () {
  describe('create', function () {
    it('should create a bucket', function (done) {
      bucketsExample.createBucketExample(bucketName, function (err, bucket) {
        assert.ifError(err);
        assert.equal(bucket.name, bucketName);
        assert(console.log.calledWith('Created bucket: ' + bucketName));
        done();
      });
    });
  });
  describe('list', function () {
    it('should list buckets', function (done) {
      bucketsExample.listBucketsExample(function (err, buckets) {
        assert.ifError(err);
        assert(Array.isArray(buckets));
        assert(buckets.length > 0);
        assert(console.log.calledWith('Found ' + buckets.length + ' buckets!'));
        done();
      });
    });
  });
  describe('delete', function () {
    it('should delete a bucket', function (done) {
      bucketsExample.deleteBucketExample(bucketName, function (err, apiResponse) {
        assert.ifError(err);
        console.log(apiResponse);
        assert(console.log.calledWith('Deleted bucket: ' + bucketName));
        done();
      });
    });
  });
});
