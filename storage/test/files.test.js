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
var srcFileName = 'test1.txt';
var destFileName = 'test2.txt';
var movedFileName = 'test3.txt';
var copiedFileName = 'test4.txt';

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
    move: sinon.stub().callsArgWith(1, null, filesMock[0]),
    copy: sinon.stub().callsArgWith(1, null, filesMock[0])
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
    program: proxyquire('../files', {
      '@google-cloud/storage': StorageMock,
      yargs: proxyquire('yargs', {})
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
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listFiles(bucketName, callback);

      assert(sample.mocks.bucket.getFiles.calledOnce, 'getFiles called once');
      assert.equal(sample.mocks.bucket.getFiles.firstCall.args.length, 1, 'getFiles received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files, 'callback received files');
      assert(console.log.calledWith('Found %d file(s)!', sample.mocks.files.length));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.getFiles = sinon.stub().callsArgWith(0, error);

      sample.program.listFiles(bucketName, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('listFilesByPrefix', function () {
    it('should list files with prefix', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var prefix = '/a';
      var options = {
        bucket: bucketName,
        prefix: prefix
      };
      sample.mocks.bucket.getFiles = sinon.stub().callsArgWith(1, null, sample.mocks.files);

      sample.program.listFilesByPrefix(options, callback);

      assert(sample.mocks.bucket.getFiles.calledOnce, 'getFiles called once');
      assert.equal(sample.mocks.bucket.getFiles.firstCall.args.length, 2, 'getFiles received 2 arguments');
      assert.deepEqual(sample.mocks.bucket.getFiles.firstCall.args[0], {
        prefix: prefix
      }, 'getFiles received options');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files, 'callback received files');
      assert(console.log.calledWith('Found %d file(s)!', sample.mocks.files.length));
    });

    it('should list files with prefix and delimiter', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var prefix = '/a';
      var delimiter = '-';
      var options = {
        bucket: bucketName,
        prefix: prefix,
        delimiter: delimiter
      };
      sample.mocks.bucket.getFiles = sinon.stub().callsArgWith(1, null, sample.mocks.files);

      sample.program.listFilesByPrefix(options, callback);

      assert(sample.mocks.bucket.getFiles.calledOnce, 'getFiles called once');
      assert.equal(sample.mocks.bucket.getFiles.firstCall.args.length, 2, 'getFiles received 2 arguments');
      assert.deepEqual(sample.mocks.bucket.getFiles.firstCall.args[0], {
        prefix: prefix,
        delimiter: delimiter
      }, 'getFiles received options');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files, 'callback received files');
      assert(console.log.calledWith('Found %d file(s)!', sample.mocks.files.length));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var prefix = '/a';
      var options = {
        bucket: bucketName,
        prefix: prefix
      };
      sample.mocks.bucket.getFiles = sinon.stub().callsArgWith(1, error);

      sample.program.listFilesByPrefix(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('uploadFile', function () {
    it('should upload a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName
      };

      sample.program.uploadFile(options, callback);

      assert(sample.mocks.bucket.upload.calledOnce, 'upload called once');
      assert.equal(sample.mocks.bucket.upload.firstCall.args.length, 2, 'upload received 2 arguments');
      assert.deepEqual(sample.mocks.bucket.upload.firstCall.args[0], srcFileName, 'upload received file name');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files[0], 'callback received file');
      assert(console.log.calledWith('Uploaded gs://%s/%s', options.bucket, options.srcFile));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName
      };
      sample.mocks.bucket.upload = sinon.stub().callsArgWith(1, error);

      sample.program.uploadFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('downloadFile', function () {
    it('should download a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName,
        destFile: destFileName
      };

      sample.program.downloadFile(options, callback);

      assert(sample.mocks.file.download.calledOnce, 'download called once');
      assert.equal(sample.mocks.file.download.firstCall.args.length, 2, 'download received 2 arguments');
      assert.deepEqual(sample.mocks.file.download.firstCall.args[0], {
        destination: options.destFile
      }, 'download received file name');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert(console.log.calledWith('Downloaded gs://%s/%s to %s', options.bucket, options.srcFile, options.destFile));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName,
        destFile: destFileName
      };
      sample.mocks.file.download = sinon.stub().callsArgWith(1, error);

      sample.program.downloadFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('deleteFile', function () {
    it('should delete a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };

      sample.program.deleteFile(options, callback);

      assert(sample.mocks.file.delete.calledOnce, 'delete called once');
      assert.equal(sample.mocks.file.delete.firstCall.args.length, 1, 'delete received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert(console.log.calledWith('Deleted gs://%s/%s', options.bucket, options.file));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };
      sample.mocks.file.delete = sinon.stub().callsArgWith(0, error);

      sample.program.deleteFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('getMetadata', function () {
    it('should get metadata for a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };

      sample.program.getMetadata(options, callback);

      assert(sample.mocks.file.getMetadata.calledOnce, 'getMetadata called once');
      assert.equal(sample.mocks.file.getMetadata.firstCall.args.length, 1, 'getMetadata received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.deepEqual(callback.firstCall.args[1], { foo: 'bar' }, 'callback received metadata');
      assert(console.log.calledWith('Got metadata for gs://%s/%s', options.bucket, options.file));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };
      sample.mocks.file.getMetadata = sinon.stub().callsArgWith(0, error);

      sample.program.getMetadata(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('makePublic', function () {
    it('should make a file public', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };

      sample.program.makePublic(options, callback);

      assert(sample.mocks.file.makePublic.calledOnce, 'makePublic called once');
      assert.equal(sample.mocks.file.makePublic.firstCall.args.length, 1, 'makePublic received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert(console.log.calledWith('Made gs://%s/%s public!', options.bucket, options.file));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };
      sample.mocks.file.makePublic = sinon.stub().callsArgWith(0, error);

      sample.program.makePublic(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('moveFile', function () {
    it('should rename a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName,
        destFile: movedFileName
      };

      sample.program.moveFile(options, callback);

      assert(sample.mocks.file.move.calledOnce, 'move called once');
      assert.equal(sample.mocks.file.move.firstCall.args.length, 2, 'move received 2 arguments');
      assert.deepEqual(sample.mocks.file.move.firstCall.args[0], options.destFile, 'move received options');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files[0], 'callback received file');
      assert(console.log.calledWith('Renamed gs://%s/%s to gs://%s/%s', options.bucket, options.srcFile, options.bucket, options.destFile));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName,
        destFile: movedFileName
      };
      sample.mocks.file.move = sinon.stub().callsArgWith(1, error);

      sample.program.moveFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('copyFile', function () {
    it('should copy a file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        srcBucket: bucketName,
        srcFile: srcFileName,
        destFile: copiedFileName,
        destBucket: bucketName
      };

      sample.program.copyFile(options, callback);

      assert(sample.mocks.file.copy.calledOnce, 'copy called once');
      assert.equal(sample.mocks.file.copy.firstCall.args.length, 2, 'copy received 2 arguments');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.files[0], 'callback received file');
      assert(console.log.calledWith('Copied gs://%s/%s to gs://%s/%s', options.srcBucket, options.srcFile, options.destBucket, options.destFile));
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        srcBucket: bucketName,
        srcFile: srcFileName,
        destFile: copiedFileName,
        destBucket: bucketName
      };
      sample.mocks.file.copy = sinon.stub().callsArgWith(1, error);

      sample.program.copyFile(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('main', function () {
    it('should call listFiles', function () {
      var program = getSample().program;

      sinon.stub(program, 'listFiles');
      program.main(['list', bucketName]);
      assert.equal(program.listFiles.calledOnce, true);
      assert.deepEqual(program.listFiles.firstCall.args.slice(0, -1), [bucketName]);
    });

    it('should call listFilesByPrefix', function () {
      var program = getSample().program;

      sinon.stub(program, 'listFilesByPrefix');
      program.main(['list', bucketName, '-p', 'public/']);
      assert.equal(program.listFilesByPrefix.calledOnce, true);
      assert.deepEqual(program.listFilesByPrefix.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        prefix: 'public/',
        delimiter: undefined
      }]);
    });

    it('should call uploadFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'uploadFile');
      program.main(['upload', bucketName, srcFileName]);
      assert.equal(program.uploadFile.calledOnce, true);
      assert.deepEqual(program.uploadFile.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        srcFile: srcFileName
      }]);
    });

    it('should call downloadFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'downloadFile');
      program.main(['download', bucketName, srcFileName, destFileName]);
      assert.equal(program.downloadFile.calledOnce, true);
      assert.deepEqual(program.downloadFile.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        srcFile: srcFileName,
        destFile: destFileName
      }]);
    });

    it('should call deleteFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'deleteFile');
      program.main(['delete', bucketName, srcFileName]);
      assert.equal(program.deleteFile.calledOnce, true);
      assert.deepEqual(program.deleteFile.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        file: srcFileName
      }]);
    });

    it('should call getMetadata', function () {
      var program = getSample().program;

      sinon.stub(program, 'getMetadata');
      program.main(['getMetadata', bucketName, srcFileName]);
      assert.equal(program.getMetadata.calledOnce, true);
      assert.deepEqual(program.getMetadata.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        file: srcFileName
      }]);
    });

    it('should call makePublic', function () {
      var program = getSample().program;

      sinon.stub(program, 'makePublic');
      program.main(['makePublic', bucketName, srcFileName]);
      assert.equal(program.makePublic.calledOnce, true);
      assert.deepEqual(program.makePublic.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        file: srcFileName
      }]);
    });

    it('should call moveFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'moveFile');
      program.main(['move', bucketName, srcFileName, movedFileName]);
      assert.equal(program.moveFile.calledOnce, true);
      assert.deepEqual(program.moveFile.firstCall.args.slice(0, -1), [{
        bucket: bucketName,
        srcFile: srcFileName,
        destFile: movedFileName
      }]);
    });

    it('should call copyFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'copyFile');
      program.main(['copy', bucketName, srcFileName, bucketName, copiedFileName]);
      assert.equal(program.copyFile.calledOnce, true);
      assert.deepEqual(program.copyFile.firstCall.args.slice(0, -1), [{
        srcBucket: bucketName,
        srcFile: srcFileName,
        destBucket: bucketName,
        destFile: copiedFileName
      }]);
    });
  });
});
