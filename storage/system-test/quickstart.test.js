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

const proxyquire = require(`proxyquire`).noPreserveCache();
const storage = proxyquire(`@google-cloud/storage`, {})();
const uuid = require(`node-uuid`);

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;

describe(`storage:quickstart`, () => {
  let storageMock, StorageMock;

  after((done) => {
    storage.bucket(bucketName).delete(() => {
      // Ignore any error, the topic might not have been created
      done();
    });
  });

  it(`should create a topic`, (done) => {
    const expectedBucketName = `my-new-bucket`;

    storageMock = {
      createBucket: (_bucketName, _callback) => {
        assert.equal(_bucketName, expectedBucketName);
        assert.equal(typeof _callback, 'function');

        storage.createBucket(bucketName, (err, bucket, apiResponse) => {
          _callback(err, bucket, apiResponse);
          assert.ifError(err);
          assert.notEqual(bucket, undefined);
          assert.equal(bucket.name, bucketName);
          assert.notEqual(apiResponse, undefined);
          assert.equal(console.log.calledOnce, true);
          assert.deepEqual(console.log.firstCall.args, [`Bucket ${bucket.name} created.`]);
          done();
        });
      }
    };
    StorageMock = sinon.stub().returns(storageMock);

    proxyquire(`../quickstart`, {
      '@google-cloud/storage': StorageMock
    });
  });
});
