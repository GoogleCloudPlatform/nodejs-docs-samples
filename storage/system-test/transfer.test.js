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

var uuid = require('node-uuid');
var program = require('../transfer');
var Storage = require('@google-cloud/storage');

var storage = Storage();
var firstBucketName = 'nodejs-docs-samples-test-' + uuid.v4();
var secondBucketName = 'nodejs-docs-samples-test-' + uuid.v4();

describe('storage:transfer', function () {
  var jobName;
  var date = '2222/08/11';
  var time = '15:30';
  var description = 'this is a test';
  var status = 'DISABLED';

  before(function (done) {
    storage.createBucket(firstBucketName, function (err) {
      if (err) {
        return done(err);
      }
      storage.createBucket(secondBucketName, done);
    });
  });

  after(function (done) {
    storage.bucket(firstBucketName).deleteFiles({ force: true }, function (err) {
      if (err) {
        return done(err);
      }
      storage.bucket(firstBucketName).delete(function (err) {
        if (err) {
          return done(err);
        }
        storage.bucket(secondBucketName).deleteFiles({ force: true }, function (err) {
          if (err) {
            return done(err);
          }
          storage.bucket(secondBucketName).delete(done);
        });
      });
    });
  });

  describe('createTransferJob', function () {
    it('should create a storage transfer job', function (done) {
      var options = {
        srcBucket: firstBucketName,
        destBucket: secondBucketName,
        date: date,
        time: time,
        description: description
      };

      program.createTransferJob(options, function (err, transferJob) {
        assert.ifError(err);
        jobName = transferJob.name;
        assert.equal(transferJob.name.indexOf('transferJobs/'), 0);
        assert.equal(transferJob.description, description);
        assert.equal(transferJob.status, 'ENABLED');
        assert(console.log.calledWith('Created transfer job: %s', transferJob.name));
        setTimeout(done, 2000);
      });
    });
  });

  describe('getTransferJob', function () {
    it('should get a transferJob', function (done) {
      program.getTransferJob(jobName, function (err, transferJob) {
        assert.ifError(err);
        assert.equal(transferJob.name, jobName);
        assert.equal(transferJob.description, description);
        assert.equal(transferJob.status, 'ENABLED');
        assert(console.log.calledWith('Found transfer job: %s', transferJob.name));
        setTimeout(done, 2000);
      });
    });
  });

  describe('updateTransferJob', function () {
    it('should update a transferJob', function (done) {
      var options = {
        job: jobName,
        field: 'status',
        value: status
      };

      program.updateTransferJob(options, function (err, transferJob) {
        assert.ifError(err);
        assert.equal(transferJob.name, jobName);
        assert.equal(transferJob.description, description);
        assert.equal(transferJob.status, status);
        assert(console.log.calledWith('Updated transfer job: %s', transferJob.name));
        setTimeout(done, 2000);
      });
    });
  });

  describe('listTransferJobs', function () {
    it('should list transferJobs', function (done) {
      program.listTransferJobs(function (err, transferJobs) {
        assert.ifError(err);
        var matchingTransferJobs = transferJobs.filter(function (transferJob) {
          return transferJob.name === jobName;
        });
        assert.equal(matchingTransferJobs.length, 1);
        assert.equal(matchingTransferJobs[0].name, jobName);
        assert.equal(matchingTransferJobs[0].description, description);
        assert.equal(matchingTransferJobs[0].status, status);
        assert(console.log.calledWith('Found %d jobs!', transferJobs.length));
        setTimeout(done, 2000);
      });
    });
  });

  describe('listTransferOperations', function () {
    it('should list transferJobs', function (done) {
      program.listTransferOperations(jobName, function (err, operations) {
        assert.ifError(err);
        assert(Array.isArray(operations));
        done();
      });
    });
  });
});
