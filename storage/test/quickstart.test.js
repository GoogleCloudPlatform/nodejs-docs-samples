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

describe(`storage:quickstart`, () => {
  let storageMock, StorageMock;
  const error = new Error(`error`);
  const expectedBucketName = `my-new-bucket`;

  before(() => {
    storageMock = {
      createBucket: sinon.stub().yields(error)
    };
    StorageMock = sinon.stub().returns(storageMock);
  });

  it(`should handle error`, () => {
    proxyquire(`../quickstart`, {
      '@google-cloud/storage': StorageMock
    });

    assert.equal(StorageMock.calledOnce, true);
    assert.deepEqual(StorageMock.firstCall.args, [{ projectId: 'YOUR_PROJECT_ID' }]);
    assert.equal(storageMock.createBucket.calledOnce, true);
    assert.deepEqual(storageMock.createBucket.firstCall.args.slice(0, -1), [expectedBucketName]);
    assert.equal(console.error.calledOnce, true);
    assert.deepEqual(console.error.firstCall.args, [error]);
  });
});
