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

describe(`storage:acl`, () => {
  it(`should handle errors`, () => {
    const bucketName = `foo`;
    const fileName = `file.txt`;
    const userEmail = `bob@company.com`;
    const error = new Error(`error`);
    const callback = sinon.spy();
    const fileMock = {
      acl: {
        get: sinon.stub().yields(error),
        owners: {
          addUser: sinon.stub().yields(error),
          deleteUser: sinon.stub().yields(error)
        }
      }
    };
    const bucketMock = {
      acl: {
        get: sinon.stub().yields(error),
        owners: {
          addUser: sinon.stub().yields(error),
          deleteUser: sinon.stub().yields(error)
        },
        default: {
          owners: {
            addUser: sinon.stub().yields(error),
            deleteUser: sinon.stub().yields(error)
          }
        }
      },
      file: sinon.stub().returns(fileMock)
    };
    const storageMock = {
      bucket: sinon.stub().returns(bucketMock)
    };
    const StorageMock = sinon.stub().returns(storageMock);
    const program = proxyquire(`../acl`, {
      '@google-cloud/storage': StorageMock
    });

    program.printBucketAcl(bucketName, callback);
    program.printBucketAclForUser(bucketName, userEmail, callback);
    program.addBucketOwner(bucketName, userEmail, callback);
    program.removeBucketOwner(bucketName, userEmail, callback);
    program.addBucketDefaultOwner(bucketName, userEmail, callback);
    program.removeBucketDefaultOwner(bucketName, userEmail, callback);
    program.printFileAcl(bucketName, fileName, callback);
    program.printFileAclForUser(bucketName, fileName, userEmail, callback);
    program.addFileOwner(bucketName, fileName, userEmail, callback);
    program.removeFileOwner(bucketName, fileName, userEmail, callback);

    assert.equal(callback.callCount, 10);
    assert.equal(callback.alwaysCalledWithExactly(error), true);
  });
});
