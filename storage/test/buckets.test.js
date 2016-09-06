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
    create: sinon.stub().yields(null, bucketsMock[0]),
    delete: sinon.stub().yields(null)
  };
  var storageMock = {
    getBuckets: sinon.stub().yields(null, bucketsMock, null, bucketsMock),
    bucket: sinon.stub().returns(bucketMock)
  };
  var StorageMock = sinon.stub().returns(storageMock);

  return {
    program: proxyquire('../buckets', {
      '@google-cloud/storage': StorageMock,
      yargs: proxyquire('yargs', {})
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
  describe('createBucket', function () {
    it('should create a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.createBucket(bucketName, callback);

      assert.equal(sample.mocks.bucket.create.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.create.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.buckets[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Created bucket: %s', bucketName]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.create.yields(error);

      sample.program.createBucket(bucketName, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('listBuckets', function () {
    it('should list buckets', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listBuckets(callback);

      assert.equal(sample.mocks.storage.getBuckets.calledOnce, true);
      assert.deepEqual(sample.mocks.storage.getBuckets.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.buckets]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d bucket(s)!', sample.mocks.buckets.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.storage.getBuckets.yields(error);

      sample.program.listBuckets(callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('deleteBuckets', function () {
    it('should delete a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.deleteBucket(bucketName, callback);

      assert.equal(sample.mocks.bucket.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.delete.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted bucket: %s', bucketName]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.delete.yields(error);

      sample.program.deleteBucket(bucketName, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('main', function () {
    it('should call createBucket', function () {
      var program = getSample().program;

      sinon.stub(program, 'createBucket');
      program.main(['create', bucketName]);
      assert.equal(program.createBucket.calledOnce, true);
      assert.deepEqual(program.createBucket.firstCall.args.slice(0, -1), [bucketName]);
    });

    it('should call listBuckets', function () {
      var program = getSample().program;

      sinon.stub(program, 'listBuckets');
      program.main(['list']);
      assert.equal(program.listBuckets.calledOnce, true);
      assert.deepEqual(program.listBuckets.firstCall.args.slice(0, -1), []);
    });

    it('should call deleteBucket', function () {
      var program = getSample().program;

      sinon.stub(program, 'deleteBucket');
      program.main(['delete', bucketName]);
      assert.equal(program.deleteBucket.calledOnce, true);
      assert.deepEqual(program.deleteBucket.firstCall.args.slice(0, -1), [bucketName]);
    });
  });
});
