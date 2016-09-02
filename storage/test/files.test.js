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
    download: sinon.stub().yields(null),
    getMetadata: sinon.stub().yields(null, { foo: 'bar' }),
    makePublic: sinon.stub().yields(null),
    delete: sinon.stub().yields(null),
    move: sinon.stub().yields(null, filesMock[0]),
    copy: sinon.stub().yields(null, filesMock[0])
  };
  var bucketMock = {
    getFiles: sinon.stub().yields(null, filesMock),
    file: sinon.stub().returns(fileMock),
    upload: sinon.stub().yields(null, filesMock[0])
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

      assert.equal(sample.mocks.bucket.getFiles.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.getFiles.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.files]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d file(s)!', sample.mocks.files.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bucket.getFiles.yields(error);

      sample.program.listFiles(bucketName, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      sample.program.listFilesByPrefix(options, callback);

      assert.equal(sample.mocks.bucket.getFiles.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.getFiles.firstCall.args.slice(0, -1), [{
        prefix: prefix
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.files]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d file(s)!', sample.mocks.files.length]);
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

      sample.program.listFilesByPrefix(options, callback);

      assert.equal(sample.mocks.bucket.getFiles.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.getFiles.firstCall.args.slice(0, -1), [{
        prefix: prefix,
        delimiter: delimiter
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.files]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d file(s)!', sample.mocks.files.length]);
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
      sample.mocks.bucket.getFiles.yields(error);

      sample.program.listFilesByPrefix(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.bucket.upload.calledOnce, true);
      assert.deepEqual(sample.mocks.bucket.upload.firstCall.args.slice(0, -1), [srcFileName]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.files[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Uploaded gs://%s/%s', options.bucket, options.srcFile]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        srcFile: srcFileName
      };
      sample.mocks.bucket.upload.yields(error);

      sample.program.uploadFile(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.file.download.calledOnce, true);
      assert.deepEqual(sample.mocks.file.download.firstCall.args.slice(0, -1), [{
        destination: options.destFile
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Downloaded gs://%s/%s to %s', options.bucket, options.srcFile, options.destFile]);
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
      sample.mocks.file.download.yields(error);

      sample.program.downloadFile(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.file.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.file.delete.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted gs://%s/%s', options.bucket, options.file]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };
      sample.mocks.file.delete.yields(error);

      sample.program.deleteFile(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.file.getMetadata.calledOnce, true);
      assert.deepEqual(sample.mocks.file.getMetadata.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, { foo: 'bar' }]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Got metadata for gs://%s/%s', options.bucket, options.file]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };
      sample.mocks.file.getMetadata.yields(error);

      sample.program.getMetadata(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.file.makePublic.calledOnce, true);
      assert.deepEqual(sample.mocks.file.makePublic.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Made gs://%s/%s public!', options.bucket, options.file]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        bucket: bucketName,
        file: srcFileName
      };
      sample.mocks.file.makePublic.yields(error);

      sample.program.makePublic(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.file.move.calledOnce, true);
      assert.deepEqual(sample.mocks.file.move.firstCall.args.slice(0, -1), [options.destFile]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.files[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Renamed gs://%s/%s to gs://%s/%s', options.bucket, options.srcFile, options.bucket, options.destFile]);
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
      sample.mocks.file.move.yields(error);

      sample.program.moveFile(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

      assert.equal(sample.mocks.file.copy.calledOnce, true);
      assert.deepEqual(sample.mocks.file.copy.firstCall.args.slice(0, -1), [sample.mocks.storage.bucket(options.destBucket).file(options.destFile)]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.files[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Copied gs://%s/%s to gs://%s/%s', options.srcBucket, options.srcFile, options.destBucket, options.destFile]);
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
      sample.mocks.file.copy.yields(error);

      sample.program.copyFile(options, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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
