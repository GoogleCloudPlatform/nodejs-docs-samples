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

describe(`storage:files`, () => {
  it(`should handle errors`, () => {
    const bucketName = `foo`;
    const fileName = `file.txt`;
    const error = new Error(`error`);
    const callback = sinon.spy();
    const fileMock = {
      copy: sinon.stub().yields(error),
      delete: sinon.stub().yields(error),
      download: sinon.stub().yields(error),
      getMetadata: sinon.stub().yields(error),
      getSignedUrl: sinon.stub().yields(error),
      makePublic: sinon.stub().yields(error),
      move: sinon.stub().yields(error)
    };
    const bucketMock = {
      file: sinon.stub().returns(fileMock),
      getFiles: sinon.stub().yields(error),
      upload: sinon.stub().yields(error)
    };
    const storageMock = {
      bucket: sinon.stub().returns(bucketMock)
    };
    const StorageMock = sinon.stub().returns(storageMock);
    const program = proxyquire(`../files`, {
      '@google-cloud/storage': StorageMock
    });

    program.listFiles(bucketName, callback);
    program.listFilesByPrefix(bucketName, `public/`, undefined, callback);
    program.uploadFile(bucketName, fileName, callback);
    program.downloadFile(bucketName, fileName, fileName, callback);
    program.deleteFile(bucketName, fileName, callback);
    program.getMetadata(bucketName, fileName, callback);
    program.generateSignedUrl(bucketName, fileName, callback);
    program.makePublic(bucketName, fileName, callback);
    program.moveFile(bucketName, fileName, fileName, callback);
    program.copyFile(bucketName, fileName, bucketName, fileName, callback);

    assert.equal(callback.callCount, 10);
    assert.equal(callback.alwaysCalledWithExactly(error), true);
  });
});
