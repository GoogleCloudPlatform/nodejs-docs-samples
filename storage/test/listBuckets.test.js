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

function getSample () {
  var bucketsMock = [
    {
      id: 'foo',
      name: 'foo'
    }
  ];
  var storageMock = {
    getBuckets: sinon.stub().callsArgWith(1, null, bucketsMock, null, bucketsMock)
  };
  var gcloudMock = {
    storage: sinon.stub().returns(storageMock)
  };
  return {
    sample: proxyquire('../listBuckets', {
      gcloud: gcloudMock
    }),
    mocks: {
      gcloud: gcloudMock,
      storage: storageMock,
      buckets: bucketsMock
    }
  };
}

describe('storage:listBuckets', function () {
  it('should list buckets', function () {
    var listBucketsSample = getSample();

    listBucketsSample.sample.main(process.env.GCLOUD_PROJECT, function (err, buckets) {
      assert.ifError(err);
      assert.strictEqual(buckets, listBucketsSample.mocks.buckets);
      assert.deepEqual(listBucketsSample.mocks.storage.getBuckets.firstCall.args[0], {
        maxResults: 5
      });
      assert(console.log.calledWith('Found 1 buckets!'));
      assert(console.log.calledWith('No more pages.'));
    });
  });
  it('should list buckets and say if there are more pages', function () {
    var listBucketsSample = getSample();
    listBucketsSample.mocks.storage.getBuckets = sinon.stub().callsArgWith(1, null, listBucketsSample.mocks.buckets, {}, listBucketsSample.mocks.buckets);

    listBucketsSample.sample.main(process.env.GCLOUD_PROJECT, function (err, buckets) {
      assert.ifError(err);
      assert.strictEqual(buckets, listBucketsSample.mocks.buckets);
      assert.deepEqual(listBucketsSample.mocks.storage.getBuckets.firstCall.args[0], {
        maxResults: 5
      });
      assert(console.log.calledWith('Found 1 buckets!'));
      assert(console.log.calledWith('More pages available.'));
    });
  });
  it('should handle error', function () {
    var error = 'listBuckets_error';
    var listBucketsSample = getSample();
    listBucketsSample.mocks.storage.getBuckets = sinon.stub().callsArgWith(1, error);

    listBucketsSample.sample.main(process.env.GCLOUD_PROJECT, function (err, buckets) {
      assert.equal(err, error);
      assert(!buckets);
    });
  });
});
