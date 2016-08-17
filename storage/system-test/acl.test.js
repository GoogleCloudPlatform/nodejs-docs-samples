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

var path = require('path');
var Storage = require('@google-cloud/storage');
var uuid = require('node-uuid');
var program = require('../acl');

var storage = Storage();
var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();
var fileName = 'test.txt';
var entity = 'allAuthenticatedUsers';
var role = 'READER';
var filePath = path.join(__dirname, '../resources', fileName);

var expected = {
  entity: entity,
  role: role
};

describe('storage:acl', function () {
  before(function (done) {
    storage.createBucket(bucketName, function (err, bucket) {
      if (err) {
        return done(err);
      }
      bucket.upload(filePath, done);
    });
  });

  after(function (done) {
    storage.bucket(bucketName).deleteFiles({ force: true }, function (err) {
      if (err) {
        return done(err);
      }
      storage.bucket(bucketName).delete(done);
    });
  });

  describe('add', function () {
    it('should add access controls to a bucket', function (done) {
      program.addAccessControl({
        bucket: bucketName,
        entity: entity,
        role: role
      }, function (err, aclObject) {
        assert.ifError(err);
        assert.deepEqual(aclObject, expected);
        done();
      });
    });

    it('should add "default" access controls to a bucket', function (done) {
      program.addAccessControl({
        bucket: bucketName,
        entity: entity,
        role: role,
        default: true
      }, function (err, aclObject) {
        assert.ifError(err);
        assert.deepEqual(aclObject, expected);
        done();
      });
    });

    it('should add access controls to a file', function (done) {
      program.addAccessControl({
        bucket: bucketName,
        file: fileName,
        entity: entity,
        role: role
      }, function (err, aclObject) {
        assert.ifError(err);
        assert.ifError(err);
        assert.deepEqual(aclObject, expected);
        setTimeout(done, 2000); // Make sure changes have time to take effect
      });
    });
  });

  describe('get', function () {
    it('should get all access controls for a bucket', function (done) {
      program.getAccessControl({
        bucket: bucketName
      }, function (err, aclObjects) {
        assert.ifError(err);
        assert(Array.isArray(aclObjects));
        assert(aclObjects.length > 1);
        var matchesExpected = aclObjects.filter(function (aclObject) {
          return aclObject.entity === entity && aclObject.role === role;
        });
        assert.equal(matchesExpected.length, 1, 'Recently added aclObject should be in list');
        done();
      });
    });

    it('should get an entity\'s access controls for a bucket', function (done) {
      program.getAccessControl({
        bucket: bucketName,
        entity: entity
      }, function (err, aclObject) {
        assert.ifError(err);
        assert.deepEqual(aclObject, expected);
        done();
      });
    });

    it('should get all "default" access controls for a bucket', function (done) {
      program.getAccessControl({
        bucket: bucketName,
        default: true
      }, function (err, aclObjects) {
        assert.ifError(err);
        assert(Array.isArray(aclObjects));
        assert(aclObjects.length > 1);
        var matchesExpected = aclObjects.filter(function (aclObject) {
          return aclObject.entity === entity && aclObject.role === role;
        });
        assert.equal(matchesExpected.length, 1, 'Recently added aclObject should be in list');
        done();
      });
    });

    it('should get an entity\'s "default" access controls for a bucket', function (done) {
      program.getAccessControl({
        bucket: bucketName,
        entity: entity,
        default: true
      }, function (err, aclObject) {
        assert.ifError(err);
        assert.deepEqual(aclObject, expected);
        done();
      });
    });

    it('should get all access controls for a file', function (done) {
      program.getAccessControl({
        bucket: bucketName,
        file: fileName
      }, function (err, aclObjects) {
        assert.ifError(err);
        assert(Array.isArray(aclObjects));
        assert(aclObjects.length > 1);
        var matchesExpected = aclObjects.filter(function (aclObject) {
          return aclObject.entity === entity && aclObject.role === role;
        });
        assert.equal(matchesExpected.length, 1, 'Recently added aclObject should be in list');
        done();
      });
    });

    it('should get an entity\'s access controls for a file', function (done) {
      program.getAccessControl({
        bucket: bucketName,
        file: fileName,
        entity: entity
      }, function (err, aclObject) {
        assert.ifError(err);
        assert.deepEqual(aclObject, expected);
        done();
      });
    });
  });

  describe('delete', function () {
    it('should delete an entity\'s access controls from a file', function (done) {
      program.deleteAccessControl({
        bucket: bucketName,
        file: fileName,
        entity: entity
      }, function (err) {
        assert.ifError(err);

        program.getAccessControl({
          bucket: bucketName,
          file: fileName,
          entity: entity
        }, function (err, aclObject) {
          assert(err);
          assert.equal(err.message, 'Not Found');
          done();
        });
      });
    });

    it('should delete an entity\'s access controls from a bucket', function (done) {
      program.deleteAccessControl({
        bucket: bucketName,
        entity: entity
      }, function (err, aclObject) {
        assert.ifError(err);

        program.getAccessControl({
          bucket: bucketName,
          entity: entity
        }, function (err, aclObject) {
          assert(err);
          assert.equal(err.message, 'Not Found');
          done();
        });
      });
    });

    it('should delete an entity\'s "default" access controls from a bucket', function (done) {
      program.deleteAccessControl({
        bucket: bucketName,
        entity: entity,
        default: true
      }, function (err, aclObject) {
        assert.ifError(err);

        program.getAccessControl({
          bucket: bucketName,
          file: fileName,
          entity: entity,
          default: true
        }, function (err, aclObject) {
          assert(err);
          assert.equal(err.message, 'Not Found');
          done();
        });
      });
    });
  });
});
