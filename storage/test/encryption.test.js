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
var fileName = 'file.txt';
var key = 'keyboard-cat';

function getSample () {
  var filesMock = [
    {
      id: 'foo',
      name: 'foo'
    }
  ];
  var fileMock = {
    download: sinon.stub().callsArgWith(1, null),
    setEncryptionKey: sinon.stub()
  };
  var bucketMock = {
    upload: sinon.stub().callsArgWith(2, null, filesMock[0]),
    file: sinon.stub().returns(fileMock)
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };
  var StorageMock = sinon.stub().returns(storageMock);
  return {
    program: proxyquire('../encryption', {
      '@google-cloud/storage': StorageMock,
      yargs: proxyquire('yargs', {})
    }),
    mocks: {
      Storage: StorageMock,
      storage: storageMock,
      files: filesMock,
      bucket: bucketMock,
      file: fileMock
    }
  };
}

describe('storage:encryption', function () {
  describe('generateEncryptionKey', function () {
    it('should generate an encryption key', function () {
      var program = getSample().program;

      var key = program.generateEncryptionKey();
      assert(console.log.calledWith('Base 64 encoded encryption key: %s', key));
    });
  });

  describe('uploadEncryptedFile', function () {
    it('should upload a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: fileName,
        destFile: fileName,
        key: key
      };

      sample.program.uploadEncryptedFile(options, callback);

      assert(sample.mocks.bucket.upload.calledOnce, 'upload called once');
      assert.equal(sample.mocks.bucket.upload.firstCall.args.length, 3, 'upload received 3 arguments');
      assert.deepEqual(sample.mocks.bucket.upload.firstCall.args[0], fileName, 'upload received file name');
      assert.deepEqual(sample.mocks.bucket.upload.firstCall.args[1], {
        destination: options.destFile,
        encryptionKey: new Buffer(options.key, 'base64')
      }, 'upload received config');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files[0], 'callback received file');
      assert(console.log.calledWith('Uploaded gs://%s/%s', options.bucket, options.destFile));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: fileName,
        destFile: fileName,
        key: key
      };
      sample.mocks.bucket.upload = sinon.stub().callsArgWith(2, error);

      sample.program.uploadEncryptedFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('downloadEncryptedFile', function () {
    it('should download a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: fileName,
        destFile: fileName,
        key: key
      };

      sample.program.downloadEncryptedFile(options, callback);

      assert(sample.mocks.file.download.calledOnce, 'download called once');
      assert.equal(sample.mocks.file.download.firstCall.args.length, 2, 'download received 2 arguments');
      assert.deepEqual(sample.mocks.file.download.firstCall.args[0], {
        destination: options.destFile
      }, 'download received config');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert(console.log.calledWith('Downloaded gs://%s/%s to %s', options.bucket, options.srcFile, options.destFile));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: fileName,
        destFile: fileName,
        key: key
      };
      sample.mocks.file.download = sinon.stub().callsArgWith(1, error);

      sample.program.downloadEncryptedFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('rotateEncryptionKey', function () {
    it('should be implemented');
    it('should rotate an encryption key', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var expected = 'This is currently not available using the Cloud Client Library.';

      sample.program.rotateEncryptionKey(callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, expected, 'error has correct message');
    });
  });

  describe('main', function () {
    it('should call generateEncryptionKey', function () {
      var program = getSample().program;

      sinon.stub(program, 'generateEncryptionKey');
      program.main(['generate-encryption-key']);
      assert.equal(program.generateEncryptionKey.calledOnce, true);
      assert.deepEqual(program.generateEncryptionKey.firstCall.args.slice(0, -1), []);
    });

    it('should call uploadEncryptedFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'uploadEncryptedFile');
      program.main(['upload', bucketName, fileName, fileName, key]);
      assert.equal(program.uploadEncryptedFile.calledOnce, true);
      assert.deepEqual(program.uploadEncryptedFile.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        srcFile: fileName,
        destFile: fileName,
        key: key
      }]);
    });

    it('should call downloadEncryptedFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'downloadEncryptedFile');
      program.main(['download', bucketName, fileName, fileName, key]);
      assert.equal(program.downloadEncryptedFile.calledOnce, true);
      assert.deepEqual(program.downloadEncryptedFile.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        srcFile: fileName,
        destFile: fileName,
        key: key
      }]);
    });

    it('should call rotateEncryptionKey', function () {
      var program = getSample().program;

      sinon.stub(program, 'rotateEncryptionKey');
      program.main(['rotate', bucketName, fileName, key, key]);
      assert.equal(program.rotateEncryptionKey.calledOnce, true);
      assert.deepEqual(program.rotateEncryptionKey.firstCall.args.slice(0, -1), []);
    });
  });
});
