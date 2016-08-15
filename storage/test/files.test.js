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
    getMetadata: sinon.stub().callsArgWith(0, null, { foo: 'bar' }),
    makePublic: sinon.stub().callsArgWith(0, null),
    delete: sinon.stub().callsArgWith(0, null),
    move: sinon.stub().callsArgWith(1, null, filesMock[0])
  };
  var bucketMock = {
    getFiles: sinon.stub().callsArgWith(0, null, filesMock, null, filesMock),
    file: sinon.stub().returns(fileMock),
    upload: sinon.stub().callsArgWith(1, null, filesMock[0])
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };
  var StorageMock = sinon.stub().returns(storageMock);
  return {
    sample: proxyquire('../files', {
      '@google-cloud/storage': StorageMock
    }),
    mocks: {
      Storage: StorageMock,
      storage: storageMock,
      files: filesMock,
      file: fileMock,
      bucket: bucketMock
    }
  };
}

describe('storage:files', function () {
  describe('list', function () {
    it('should list files', function () {
      var filesSample = getSample();

      filesSample.sample.listFiles(bucketName, function (err, files) {
        assert.ifError(err);
        assert.strictEqual(files, filesSample.mocks.files);
        assert(console.log.calledWith('Found %d files!', filesSample.mocks.files.length));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.listFiles(undefined, function (err, files) {
        assert(err);
        assert(err.message = '"name" is required!');
        assert.equal(files, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'listError';
      var filesSample = getSample();
      filesSample.mocks.bucket.getFiles = sinon.stub().callsArgWith(0, error);

      filesSample.sample.listFiles(bucketName, function (err, files) {
        assert.equal(err, error);
        assert.equal(files, undefined);
      });
    });
  });
  describe('listWithPrefix', function () {
    it('should list files with prefix', function () {
      var filesSample = getSample();
      filesSample.mocks.bucket.getFiles = sinon.stub().callsArgWith(1, null, filesSample.mocks.files);

      filesSample.sample.listFilesWithPrefix(bucketName, '/a', undefined, function (err, files) {
        assert.ifError(err);
        assert.strictEqual(files, filesSample.mocks.files);
        assert(console.log.calledWith('Found %d files!', filesSample.mocks.files.length));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.listFilesWithPrefix(undefined, undefined, undefined, function (err, files) {
        assert(err);
        assert(err.message = '"name" is required!');
        assert.equal(files, undefined);
      });
    });
    it('should require prefix', function () {
      var filesSample = getSample();

      filesSample.sample.listFilesWithPrefix(bucketName, undefined, undefined, function (err, files) {
        assert(err);
        assert(err.message = '"prefix" is required!');
        assert.equal(files, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'listError';
      var filesSample = getSample();
      filesSample.mocks.bucket.getFiles = sinon.stub().callsArgWith(1, error);

      filesSample.sample.listFilesWithPrefix(bucketName, '/a', undefined, function (err, files) {
        assert.equal(err, error);
        assert.equal(files, undefined);
      });
    });
  });
  describe('uploadFile', function () {
    var fileName = 'test.txt';
    it('should upload a file', function () {
      var filesSample = getSample();

      filesSample.sample.uploadFile(bucketName, fileName, function (err, file) {
        assert.ifError(err);
        assert.strictEqual(file, filesSample.mocks.files[0]);
        assert(console.log.calledWith('Uploaded file: %s', fileName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.uploadFile(undefined, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"name" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should require fileName', function () {
      var filesSample = getSample();

      filesSample.sample.uploadFile(bucketName, undefined, function (err, file) {
        assert(err);
        assert(err.message = '"fileName" is required!');
        assert.equal(file, undefined);
      });
    });
    it('should handle error', function () {
      var error = 'uploadError';
      var filesSample = getSample();
      filesSample.mocks.bucket.upload = sinon.stub().callsArgWith(1, error);

      filesSample.sample.uploadFile(bucketName, fileName, function (err, file) {
        assert.equal(err, error);
        assert.equal(file, undefined);
      });
    });
  });
  describe('downloadFile', function () {
    var fileName = 'test.txt';
    it('should download a file', function () {
      var filesSample = getSample();

      filesSample.sample.downloadFile(bucketName, fileName, fileName, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('Downloaded %s to %s', fileName, fileName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.downloadFile(undefined, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"name" is required!');
      });
    });
    it('should require srcFileName', function () {
      var filesSample = getSample();

      filesSample.sample.downloadFile(bucketName, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"srcFileName" is required!');
      });
    });
    it('should require destFileName', function () {
      var filesSample = getSample();

      filesSample.sample.downloadFile(bucketName, fileName, undefined, function (err) {
        assert(err);
        assert(err.message = '"destFileName" is required!');
      });
    });
    it('should handle error', function () {
      var error = 'downloadError';
      var filesSample = getSample();
      filesSample.mocks.file.download = sinon.stub().callsArgWith(1, error);

      filesSample.sample.downloadFile(bucketName, fileName, fileName, function (err) {
        assert.equal(err, error);
      });
    });
  });
  describe('deleteFile', function () {
    var fileName = 'test.txt';
    it('should delete a file', function () {
      var filesSample = getSample();

      filesSample.sample.deleteFile(bucketName, fileName, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('Deleted file: %s', fileName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.deleteFile(undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"name" is required!');
      });
    });
    it('should require fileName', function () {
      var filesSample = getSample();

      filesSample.sample.deleteFile(bucketName, undefined, function (err) {
        assert(err);
        assert(err.message = '"fileName" is required!');
      });
    });
    it('should handle error', function () {
      var error = 'deleteError';
      var filesSample = getSample();
      filesSample.mocks.file.delete = sinon.stub().callsArgWith(0, error);

      filesSample.sample.deleteFile(bucketName, fileName, function (err) {
        assert.equal(err, error);
      });
    });
  });
  describe('getMetadata', function () {
    var fileName = 'test.txt';
    it('should get metadata for a file', function () {
      var filesSample = getSample();

      filesSample.sample.getMetadata(bucketName, fileName, function (err, metadata) {
        assert.ifError(err);
        assert.deepEqual(metadata, { foo: 'bar' });
        assert(console.log.calledWith('Got metadata for file: %s', fileName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.getMetadata(undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"name" is required!');
      });
    });
    it('should require fileName', function () {
      var filesSample = getSample();

      filesSample.sample.getMetadata(bucketName, undefined, function (err) {
        assert(err);
        assert(err.message = '"fileName" is required!');
      });
    });
    it('should handle error', function () {
      var error = 'getMetadataError';
      var filesSample = getSample();
      filesSample.mocks.file.getMetadata = sinon.stub().callsArgWith(0, error);

      filesSample.sample.getMetadata(bucketName, fileName, function (err) {
        assert.equal(err, error);
      });
    });
  });
  describe('makePublic', function () {
    var fileName = 'test.txt';
    it('should make a file public', function () {
      var filesSample = getSample();

      filesSample.sample.makePublic(bucketName, fileName, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('Made %s public!', fileName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.makePublic(undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"name" is required!');
      });
    });
    it('should require fileName', function () {
      var filesSample = getSample();

      filesSample.sample.makePublic(bucketName, undefined, function (err) {
        assert(err);
        assert(err.message = '"fileName" is required!');
      });
    });
    it('should handle error', function () {
      var error = 'makePublicError';
      var filesSample = getSample();
      filesSample.mocks.file.makePublic = sinon.stub().callsArgWith(0, error);

      filesSample.sample.makePublic(bucketName, fileName, function (err) {
        assert.equal(err, error);
      });
    });
  });
  describe('moveFile', function () {
    var fileName = 'test.txt';
    it('should move a file', function () {
      var filesSample = getSample();

      filesSample.sample.moveFile(bucketName, fileName, fileName, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('%s moved to %s', fileName, fileName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.moveFile(undefined, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"name" is required!');
      });
    });
    it('should require srcFileName', function () {
      var filesSample = getSample();

      filesSample.sample.moveFile(bucketName, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"srcFileName" is required!');
      });
    });
    it('should require destFileName', function () {
      var filesSample = getSample();

      filesSample.sample.moveFile(bucketName, fileName, undefined, function (err) {
        assert(err);
        assert(err.message = '"destFileName" is required!');
      });
    });
    it('should handle error', function () {
      var error = 'moveFileError';
      var filesSample = getSample();
      filesSample.mocks.file.move = sinon.stub().callsArgWith(1, error);

      filesSample.sample.moveFile(bucketName, fileName, fileName, function (err) {
        assert.equal(err, error);
      });
    });
  });
  describe('copyFile', function () {
    var fileName = 'test.txt';
    it('should copy a file', function () {
      var filesSample = getSample();

      filesSample.sample.copyFile(bucketName, fileName, bucketName, fileName, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('%s moved to %s in %s', fileName, fileName, bucketName));
      });
    });
    it('should require name', function () {
      var filesSample = getSample();

      filesSample.sample.copyFile(undefined, undefined, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"name" is required!');
      });
    });
    it('should require srcFileName', function () {
      var filesSample = getSample();

      filesSample.sample.copyFile(bucketName, undefined, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"srcFileName" is required!');
      });
    });
    it('should require destBucketName', function () {
      var filesSample = getSample();

      filesSample.sample.copyFile(bucketName, fileName, undefined, undefined, function (err) {
        assert(err);
        assert(err.message = '"destBucketName" is required!');
      });
    });
    it('should require destFileName', function () {
      var filesSample = getSample();

      filesSample.sample.copyFile(bucketName, fileName, bucketName, undefined, function (err) {
        assert(err);
        assert(err.message = '"destFileName" is required!');
      });
    });
    it('should handle error', function () {
      var error = 'copyFileError';
      var filesSample = getSample();
      filesSample.mocks.file.move = sinon.stub().callsArgWith(1, error);

      filesSample.sample.copyFile(bucketName, fileName, bucketName, fileName, function (err) {
        assert.equal(err, error);
      });
    });
  });
  describe('printUsage', function () {
    it('should print usage', function () {
      var filesSample = getSample();

      filesSample.sample.printUsage();

      assert(console.log.calledWith('Usage: node files COMMAND [ARGS...]'));
      assert(console.log.calledWith('\nCommands:\n'));
      assert(console.log.calledWith('\tlist BUCKET_NAME'));
      assert(console.log.calledWith('\tlistByPrefix BUCKET_NAME PREFIX [DELIMITER]'));
      assert(console.log.calledWith('\tupload BUCKET_NAME FILE_NAME'));
      assert(console.log.calledWith('\tdownload BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME'));
      assert(console.log.calledWith('\tdelete BUCKET_NAME FILE_NAME'));
      assert(console.log.calledWith('\tgetMetadata BUCKET_NAME FILE_NAME'));
      assert(console.log.calledWith('\tmakePublic BUCKET_NAME FILE_NAME'));
      assert(console.log.calledWith('\tmove BUCKET_NAME SRC_FILE_NAME DEST_FILE_NAME'));
      assert(console.log.calledWith('\tcopy BUCKET_NAME SRC_FILE_NAME DEST_BUCKET_NAME DEST_FILE_NAME'));
    });
  });
  describe('main', function () {
    it('should call the right commands', function () {
      var program = getSample().sample;

      sinon.stub(program, 'listFiles');
      program.main(['list']);
      assert(program.listFiles.calledOnce);

      sinon.stub(program, 'listFilesWithPrefix');
      program.main(['listByPrefix']);
      assert(program.listFilesWithPrefix.calledOnce);

      sinon.stub(program, 'uploadFile');
      program.main(['upload']);
      assert(program.uploadFile.calledOnce);

      sinon.stub(program, 'downloadFile');
      program.main(['download']);
      assert(program.downloadFile.calledOnce);

      sinon.stub(program, 'deleteFile');
      program.main(['delete']);
      assert(program.deleteFile.calledOnce);

      sinon.stub(program, 'getMetadata');
      program.main(['getMetadata']);
      assert(program.getMetadata.calledOnce);

      sinon.stub(program, 'makePublic');
      program.main(['makePublic']);
      assert(program.makePublic.calledOnce);

      sinon.stub(program, 'moveFile');
      program.main(['move']);
      assert(program.moveFile.calledOnce);

      sinon.stub(program, 'copyFile');
      program.main(['copy']);
      assert(program.copyFile.calledOnce);

      sinon.stub(program, 'printUsage');
      program.main(['--help']);
      assert(program.printUsage.calledOnce);
    });
  });
});
