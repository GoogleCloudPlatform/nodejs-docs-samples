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

var proxyquire = require('proxyquire').noCallThru();
var bucketName = 'foo';

function getSample () {
  var bucketsMock = [
    {
      id: 'foo',
      name: 'foo'
    }
  ];
  var bucketMock = {
    delete: sinon.stub().callsArgWith(0, null)
  };
  var storageMock = {
    createBucket: sinon.stub().callsArgWith(1, null, bucketsMock[0]),
    getBuckets: sinon.stub().callsArgWith(0, null, bucketsMock, null, bucketsMock),
    bucket: sinon.stub().returns(bucketMock)
  };
  var StorageMock = sinon.stub().returns(storageMock);
  return {
    sample: proxyquire('../buckets', {
      '@google-cloud/storage': StorageMock
    }),
    mocks: {
      Storage: StorageMock,
      storage: storageMock,
      buckets: bucketsMock,
      bucket: bucketMock
    }
  };
}

describe('storage:buckets', function () {
  describe('create', function () {
    it('should create a bucket', function () {
      var bucketsSample = getSample();

      bucketsSample.sample.createBucket(bucketName, function (err, bucket) {
        assert.ifError(err);
        assert.strictEqual(bucket, bucketsSample.mocks.buckets[0]);
        assert(console.log.calledWith('Created bucket: %s', bucketName));
      });
    });
    it('should require name', function () {
      var bucketsSample = getSample();

      bucketsSample.sample.createBucket(undefined, function (err, bucket) {
        assert(err);
        assert(err.message = '"name" is required!');
        assert.equal(bucket, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'createError';
      var bucketsSample = getSample();
      bucketsSample.mocks.storage.createBucket = sinon.stub().callsArgWith(1, error);

      bucketsSample.sample.createBucket(bucketName, function (err, bucket) {
        assert.equal(err, error);
        assert.equal(bucket, undefined);
      });
    });
  });
  describe('list', function () {
    it('should list buckets', function () {
      var bucketsSample = getSample();

      bucketsSample.sample.listBuckets(function (err, buckets) {
        assert.ifError(err);
        assert.strictEqual(buckets, bucketsSample.mocks.buckets);
        assert(console.log.calledWith('Found %d buckets!', bucketsSample.mocks.buckets.length));
      });
    });
    it('should handle error', function () {
      var error = 'listError';
      var bucketsSample = getSample();
      bucketsSample.mocks.storage.getBuckets = sinon.stub().callsArgWith(0, error);

      bucketsSample.sample.listBuckets(function (err, buckets) {
        assert.equal(err, error);
        assert.equal(buckets, undefined);
      });
    });
  });
  describe('delete', function () {
    it('should delete a bucket', function () {
      var bucketsSample = getSample();

      bucketsSample.sample.deleteBucket(bucketName, function (err, apiResponse) {
        assert.ifError(err);
        assert.equal(bucketsSample.mocks.storage.bucket.firstCall.args[0], bucketName);
        assert(console.log.calledWith('Deleted bucket: %s', bucketName));
      });
    });
    it('should require name', function () {
      var bucketsSample = getSample();

      bucketsSample.sample.deleteBucket(undefined, function (err, apiResponse) {
        assert(err);
        assert(err.message = '"name" is required!');
        assert.equal(apiResponse, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'deleteError';
      var bucketsSample = getSample();
      bucketsSample.mocks.bucket.delete = sinon.stub().callsArgWith(0, error);

      bucketsSample.sample.deleteBucket(bucketName, function (err, apiResponse) {
        assert.equal(err, error);
        assert.equal(apiResponse, undefined);
      });
    });
  });
  describe('printUsage', function () {
    it('should print usage', function () {
      var bucketsSample = getSample();

      bucketsSample.sample.printUsage();

      assert(console.log.calledWith('Usage: node buckets COMMAND [ARGS...]'));
      assert(console.log.calledWith('\nCommands:\n'));
      assert(console.log.calledWith('\tcreate BUCKET_NAME'));
      assert(console.log.calledWith('\tlist'));
      assert(console.log.calledWith('\tdelete BUCKET_NAME'));
      assert(console.log.calledWith('\nExamples:\n'));
      assert(console.log.calledWith('\tnode buckets create my-bucket'));
      assert(console.log.calledWith('\tnode buckets list'));
      assert(console.log.calledWith('\tnode buckets delete my-bucket'));
    });
  });
  describe('main', function () {
    it('should call the right commands', function () {
      var program = getSample().sample;

      sinon.stub(program, 'createBucket');
      program.main(['create']);
      assert(program.createBucket.calledOnce);

      sinon.stub(program, 'listBuckets');
      program.main(['list']);
      assert(program.listBuckets.calledOnce);

      sinon.stub(program, 'deleteBucket');
      program.main(['delete']);
      assert(program.deleteBucket.calledOnce);

      sinon.stub(program, 'printUsage');
      program.main(['--help']);
      assert(program.printUsage.calledOnce);
    });
  });
});
