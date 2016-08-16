// Copyright 2015-2016, Google, Inc.
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

var fs = require('fs');
var path = require('path');
var Storage = require('@google-cloud/storage');
var uuid = require('node-uuid');
var filesExample = require('../files');

var storage = Storage();
var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();
var fileName = 'test.txt';
var movedFileName = 'test2.txt';
var copiedFileName = 'test3.txt';
var filePath = path.join(__dirname, '../resources', fileName);
var downloadFilePath = path.join(__dirname, '../resources/downloaded.txt');

describe('storage:files', function () {
  before(function (done) {
    storage.createBucket(bucketName, done);
  });
  after(function (done) {
    try {
      fs.unlinkSync(downloadFilePath);
    } catch (err) {
      console.log(err);
    }
    storage.bucket(bucketName).deleteFiles({ force: true }, function (err) {
      if (err) {
        return done(err);
      }
      storage.bucket(bucketName).delete(done);
    });
  });
  describe('uploadFile', function () {
    it('should upload a file', function (done) {
      filesExample.uploadFile(bucketName, filePath, function (err, file) {
        assert.ifError(err);
        assert(file);
        assert.equal(file.name, fileName);
        assert(console.log.calledWith('Uploaded file: %s', filePath));
        done();
      });
    });
  });
  describe('downloadFile', function () {
    it('should download a file', function (done) {
      filesExample.downloadFile(bucketName, fileName, downloadFilePath, function (err) {
        assert.ifError(err);
        assert.doesNotThrow(function () {
          fs.statSync(downloadFilePath);
        });
        assert(console.log.calledWith('Downloaded %s to %s', fileName, downloadFilePath));
        done();
      });
    });
  });
  describe('moveFile', function () {
    it('should move a file', function (done) {
      filesExample.moveFile(bucketName, fileName, movedFileName, function (err, file) {
        assert.ifError(err);
        assert.equal(file.name, movedFileName);
        assert(console.log.calledWith('%s moved to %s', fileName, movedFileName));
        done();
      });
    });
  });
  describe('listFiles', function () {
    it('should list files', function (done) {
      filesExample.listFiles(bucketName, function (err, files) {
        assert.ifError(err);
        assert(Array.isArray(files));
        assert.equal(files.length, 1);
        assert.equal(files[0].name, movedFileName);
        assert(console.log.calledWith('Found %d files!', files.length));
        done();
      });
    });
  });
  describe('copyFile', function () {
    it('should copy a file', function (done) {
      filesExample.copyFile(bucketName, movedFileName, bucketName, copiedFileName, function (err, file) {
        assert.ifError(err);
        assert.equal(file.name, copiedFileName);
        assert(console.log.calledWith('%s moved to %s in %s', movedFileName, copiedFileName, bucketName));
        done();
      });
    });
  });
  describe('listFilesWithPrefix', function () {
    it('should list files by a prefix', function (done) {
      filesExample.listFilesWithPrefix(bucketName, 'test', undefined, function (err, files) {
        assert.ifError(err);
        assert(Array.isArray(files));
        assert.equal(files.length, 1);
        assert.equal(files[0].name, copiedFileName);
        assert(console.log.calledWith('Found %d files!', files.length));
        filesExample.listFilesWithPrefix(bucketName, 'foo', undefined, function (err, files) {
          assert.ifError(err);
          assert(Array.isArray(files));
          assert.equal(files.length, 0);
          assert(console.log.calledWith('Found %d files!', files.length));
          done();
        });
      });
    });
  });
  describe('makePublic', function () {
    it('should make a file public', function (done) {
      filesExample.makePublic(bucketName, copiedFileName, function (err, apiResponse) {
        assert.ifError(err);
        assert(apiResponse);
        assert(console.log.calledWith('Made %s public!', copiedFileName));
        done();
      });
    });
  });
  describe('getMetadata', function () {
    it('should get metadata for a file', function (done) {
      filesExample.getMetadata(bucketName, copiedFileName, function (err, metadata) {
        assert.ifError(err);
        assert(metadata);
        assert.equal(metadata.name, copiedFileName);
        assert(console.log.calledWith('Got metadata for file: %s', copiedFileName));
        done();
      });
    });
  });
  describe('deleteFile', function () {
    it('should delete a file', function (done) {
      filesExample.deleteFile(bucketName, copiedFileName, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('Deleted file: %s', copiedFileName));
        done();
      });
    });
  });
});
