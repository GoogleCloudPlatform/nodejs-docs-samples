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

var proxyquire = require('proxyquire').noPreserveCache();
var storage = proxyquire('@google-cloud/storage', {})();
var uuid = require('node-uuid');

var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();

describe('storage:quickstart', function () {
  var storageMock, StorageMock;

  after(function (done) {
    storage.bucket(bucketName).delete(function () {
      // Ignore any error, the topic might not have been created
      done();
    });
  });

  it('should create a topic', function (done) {
    var expectedBucketName = 'my-new-bucket';

    storageMock = {
      createBucket: function (_bucketName) {
        assert.equal(_bucketName, expectedBucketName);

        storage.createBucket(bucketName, function (err, bucket, apiResponse) {
          assert.ifError(err);
          assert.notEqual(bucket, undefined);
          assert.equal(bucket.name, bucketName);
          assert.notEqual(apiResponse, undefined);
          done();
        });
      }
    };
    StorageMock = sinon.stub().returns(storageMock);

    proxyquire('../quickstart', {
      '@google-cloud/storage': StorageMock
    });
  });
});
