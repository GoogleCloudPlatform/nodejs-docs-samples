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

describe(`storage:encryption`, () => {
  it(`should handle errors`, () => {
    const bucketName = `foo`;
    const fileName = `file.txt`;
    const key = `keyboard-cat`;
    const error = new Error(`error`);
    const callback = sinon.spy();
    const fileMock = {
      download: sinon.stub().yields(error),
      setEncryptionKey: sinon.stub()
    };
    const bucketMock = {
      file: sinon.stub().returns(fileMock),
      upload: sinon.stub().yields(error)
    };
    const storageMock = {
      bucket: sinon.stub().returns(bucketMock)
    };
    const StorageMock = sinon.stub().returns(storageMock);
    const program = proxyquire(`../encryption`, {
      '@google-cloud/storage': StorageMock
    });

    program.uploadEncryptedFile(bucketName, fileName, fileName, key, callback);
    program.downloadEncryptedFile(bucketName, fileName, fileName, key, callback);

    assert.equal(callback.callCount, 2);
    assert.equal(callback.alwaysCalledWithExactly(error), true);
  });
});

