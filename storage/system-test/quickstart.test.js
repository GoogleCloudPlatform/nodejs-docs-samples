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
const uuid = require(`uuid`);

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);

describe(`storage:quickstart`, () => {
  after(() => bucket.delete().catch(() => {}));

  it(`should create a bucket`, (done) => {
    const expectedBucketName = `my-new-bucket`;

    const storageMock = {
      createBucket: (_bucketName) => {
        assert.equal(_bucketName, expectedBucketName);

        return bucket.create()
          .then((results) => {
            const bucket = results[0];

            assert.notEqual(bucket, undefined);
            assert.equal(bucket.name, bucketName);

            setTimeout(() => {
              assert.equal(console.log.calledOnce, true);
              assert.deepEqual(console.log.firstCall.args, [`Bucket ${bucket.name} created.`]);
              done();
            }, 200);

            return results;
          });
      }
    };

    proxyquire(`../quickstart`, {
      '@google-cloud/storage': sinon.stub().returns(storageMock)
    });
  });
});
