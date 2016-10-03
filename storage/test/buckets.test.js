/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require(`proxyquire`).noCallThru();

describe(`storage:buckets`, () => {
  it(`should handle errors`, () => {
    const bucketName = `foo`;
    const error = new Error(`error`);
    const callback = sinon.spy();
    const bucketMock = {
      delete: sinon.stub().yields(error)
    };
    const storageMock = {
      bucket: sinon.stub().returns(bucketMock),
      getBuckets: sinon.stub().yields(error),
      createBucket: sinon.stub().yields(error)
    };
    const StorageMock = sinon.stub().returns(storageMock);
    const program = proxyquire(`../buckets`, {
      '@google-cloud/storage': StorageMock
    });

    program.createBucket(bucketName, callback);
    program.deleteBucket(bucketName, callback);
    program.listBuckets(callback);

    assert.equal(callback.callCount, 3);
    assert.equal(callback.alwaysCalledWithExactly(error), true);
  });
});
