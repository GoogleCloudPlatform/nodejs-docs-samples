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
var gcloud = require('gcloud');
var uuid = require('node-uuid');
var storage = gcloud.storage();
var program = require('../encryption');

var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();
var fileName = 'test.txt';
var filePath = path.join(__dirname, '../resources', fileName);
var downloadFilePath = path.join(__dirname, '../resources/downloaded.txt');

describe('storage:encryption', function () {
  var key;
  before(function (done) {
    key = program.generateEncryptionKey();
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

  describe('uploadEncryptedFile', function () {
    it('should upload a file', function (done) {
      program.uploadEncryptedFile(bucketName, filePath, fileName, key, function (err, file) {
        assert.ifError(err);
        assert(file);
        assert.equal(file.name, fileName);
        assert(console.log.calledWith('Uploaded encrypted file: %s', fileName));
        done();
      });
    });
  });

  describe('downloadEncryptedFile', function () {
    it('should download a file', function (done) {
      program.downloadEncryptedFile(bucketName, fileName, downloadFilePath, key, function (err) {
        assert.ifError(err);
        assert.doesNotThrow(function () {
          fs.statSync(downloadFilePath);
        });
        assert(console.log.calledWith('Downloaded encrypted file: %s', downloadFilePath));
        done();
      });
    });
  });
});
