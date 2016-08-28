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
    create: sinon.stub().callsArgWith(0, null, bucketsMock[0]),
    delete: sinon.stub().callsArgWith(0, null)
  };
  var storageMock = {
    getBuckets: sinon.stub().callsArgWith(0, null, bucketsMock, null, bucketsMock),
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

      assert(sample.mocks.bucket.create.calledOnce, 'create called once');
      assert.equal(sample.mocks.bucket.create.firstCall.args.length, 1, 'create received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.buckets[0], 'callback received bucket');
      assert(console.log.calledWith('Created bucket: %s', bucketName));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.create = sinon.stub().callsArgWith(0, error);

      sample.program.createBucket(bucketName, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('listBuckets', function () {
    it('should list buckets', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listBuckets(callback);

      assert(sample.mocks.storage.getBuckets.calledOnce, 'getBuckets called once');
      assert.equal(sample.mocks.storage.getBuckets.firstCall.args.length, 1, 'getBuckets received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.buckets, 'callback received buckets');
      assert(console.log.calledWith('Found %d bucket(s)!', sample.mocks.buckets.length));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.storage.getBuckets = sinon.stub().callsArgWith(0, error);

      sample.program.listBuckets(callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('deleteBuckets', function () {
    it('should delete a bucket', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.deleteBucket(bucketName, callback);

      assert(sample.mocks.bucket.delete.calledOnce, 'delete called once');
      assert.equal(sample.mocks.bucket.delete.firstCall.args.length, 1, 'delete received 1 argument');
      assert.equal(sample.mocks.storage.bucket.firstCall.args[0], bucketName);
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.aclObject, 'callback received acl object');
      assert(console.log.calledWith('Deleted bucket: %s', bucketName));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.delete = sinon.stub().callsArgWith(0, error);

      sample.program.deleteBucket(bucketName, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
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
