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
  var gcloudMock = {
    storage: sinon.stub().returns(storageMock)
  };
  return {
    program: proxyquire('../encryption', {
      gcloud: gcloudMock
    }),
    mocks: {
      gcloud: gcloudMock,
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
    var fileName = 'test.txt';
    it('should upload a file', function () {
      var sample = getSample();

      sample.program.uploadEncryptedFile(bucketName, fileName, fileName, 'key', function (err, file) {
        assert.ifError(err);
        assert.strictEqual(file, sample.mocks.files[0]);
        assert(console.log.calledWith('Uploaded encrypted file: %s', fileName));
      });
    });
    it('should require bucket', function () {
      var sample = getSample();

      sample.program.uploadEncryptedFile(undefined, undefined, undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"bucket" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require srcFileName', function () {
      var sample = getSample();

      sample.program.uploadEncryptedFile(bucketName, undefined, undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"srcFileName" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require destFileName', function () {
      var sample = getSample();

      sample.program.uploadEncryptedFile(bucketName, fileName, undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"destFileName" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require key', function () {
      var sample = getSample();

      sample.program.uploadEncryptedFile(bucketName, fileName, fileName, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"key" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      sample.mocks.bucket.upload = sinon.stub().callsArgWith(2, new Error(error));

      sample.program.uploadEncryptedFile(bucketName, fileName, fileName, 'key', function (err, file) {
        assert(err);
        assert.equal(err.message, error);
        assert.equal(file, undefined);
      });
    });
  });

  describe('downloadEncryptedFile', function () {
    var fileName = 'test.txt';
    it('should upload a file', function () {
      var sample = getSample();

      sample.program.downloadEncryptedFile(bucketName, fileName, fileName, 'key', function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('Downloaded encrypted file: %s', fileName));
      });
    });
    it('should require bucket', function () {
      var sample = getSample();

      sample.program.downloadEncryptedFile(undefined, undefined, undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"bucket" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require srcFileName', function () {
      var sample = getSample();

      sample.program.downloadEncryptedFile(bucketName, undefined, undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"srcFileName" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require destFileName', function () {
      var sample = getSample();

      sample.program.downloadEncryptedFile(bucketName, fileName, undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"destFileName" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require key', function () {
      var sample = getSample();

      sample.program.downloadEncryptedFile(bucketName, fileName, fileName, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"key" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      sample.mocks.file.download = sinon.stub().callsArgWith(1, new Error(error));

      sample.program.downloadEncryptedFile(bucketName, fileName, fileName, 'key', function (err, file) {
        assert(err);
        assert.equal(err.message, error);
        assert.equal(file, undefined);
      });
    });
  });

  describe('rotateEncryptionKey', function () {
    it('should rotate an encryption key', function () {
      var sample = getSample();

      sample.program.rotateEncryptionKey(function (err) {
        assert(err);
        assert.equal(err.message, 'This is currently not available using the Cloud Client Library.');
      });
    });
  });

  describe('printUsage', function () {
    it('should print usage', function () {
      var program = getSample().program;

      program.printUsage();

      assert(console.log.calledWith('Usage: node encryption COMMAND [ARGS...]'));
      assert(console.log.calledWith('\nCommands:\n'));
      assert(console.log.calledWith('\tgenerate-encryption-key'));
      assert(console.log.calledWith('\tupload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME KEY'));
      assert(console.log.calledWith('\tdownload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME KEY'));
      assert(console.log.calledWith('\trotate BUCKET_NAME FILE_NAME OLD_KEY NEW_KEY'));
      assert(console.log.calledWith('\nExamples:\n'));
      assert(console.log.calledWith('\tnode encryption generate-encryption-key'));
      assert(console.log.calledWith('\tnode encryption upload my-bucket resources/test.txt file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q='));
      assert(console.log.calledWith('\tnode encryption download my-bucket file_encrypted.txt ./file.txt QxhqaZEqBGVTW55HhQw9Q='));
      assert(console.log.calledWith('\tnode encryption rotate my-bucket file_encrypted.txt QxhqaZEqBGVTW55HhQw9Q= SxafpsdfSDFS89sds9Q='));
    });
  });

  describe('main', function () {
    it('should call the right commands', function () {
      var program = getSample().program;

      sinon.stub(program, 'generateEncryptionKey');
      program.main(['generate-encryption-key']);
      assert(program.generateEncryptionKey.calledOnce);

      sinon.stub(program, 'uploadEncryptedFile');
      program.main(['upload']);
      assert(program.uploadEncryptedFile.calledOnce);

      sinon.stub(program, 'downloadEncryptedFile');
      program.main(['download']);
      assert(program.downloadEncryptedFile.calledOnce);

      sinon.stub(program, 'rotateEncryptionKey');
      program.main(['rotate']);
      assert(program.rotateEncryptionKey.calledOnce);

      sinon.stub(program, 'printUsage');
      program.main(['--help']);
      assert(program.printUsage.calledOnce);
    });
  });
});
