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

var gcloud = require('google-cloud');
var uuid = require('node-uuid');
var program = require('../sinks');

var logging = gcloud.logging();
var storage = gcloud.storage();

var bucketName = 'nodejs-docs-samples-test-' + uuid.v4();
var sinkName = 'nodejs-docs-samples-test-' + uuid.v4();

describe('logging:sinks', function () {
  before(function (done) {
    storage.createBucket(bucketName, done);
  });

  after(function (done) {
    logging.sink(sinkName).delete(function () {
      // Don't check for error, the sink might already have been deleted
      storage.bucket(bucketName).delete(function () {
        // Don't check for error, the bucket might already have been deleted
        done();
      });
    });
  });

  describe('createSink', function () {
    it('should create a new sink', function (done) {
      var options = {
        name: sinkName,
        destination: bucketName,
        type: 'bucket'
      };

      program.createSink(options, function (err, sink) {
        assert.ifError(err);
        assert(sink, 'sink should be defined');
        assert.equal(sink.name, sinkName, 'should have received the new sink');
        done();
      });
    });
  });

  describe('getSink', function () {
    it('should get the metadata for a sink', function (done) {
      var expected = {
        name: sinkName,
        destination: 'storage.googleapis.com/' + bucketName,
        filter: '',
        outputVersionFormat: 'V2'
      };

      program.getSinkMetadata(sinkName, function (err, metadata) {
        assert.ifError(err);
        assert.deepEqual(metadata, expected, 'should have received sink metadata');
        done();
      });
    });
  });

  describe('listSinks', function () {
    it('should list sinks', function (done) {
      program.listSinks(function (err, sinks) {
        assert.ifError(err);
        assert(Array.isArray(sinks), '"sinks" should be an array.');
        var matchingSinks = sinks.map(function (sink) {
          return sink.name === sinkName;
        });
        assert.equal(matchingSinks.length, 1, 'Newly created sink should be in list.');
        done();
      });
    });
  });

  describe('updateSink', function () {
    it('should update metdata for a sink', function (done) {
      var filter = 'severity > ALERT';
      var expected = {
        name: sinkName,
        destination: 'storage.googleapis.com/' + bucketName,
        filter: filter,
        outputVersionFormat: 'V2'
      };
      var options = {
        name: sinkName,
        metadata: {
          filter: filter
        }
      };

      program.updateSink(options, function (err) {
        assert.ifError(err);

        program.getSinkMetadata(options.name, function (err, metadata) {
          assert.ifError(err);
          assert.deepEqual(metadata, expected, 'Sink should have new metadata.');
          done();
        });
      });
    });
  });

  describe('deleteSink', function () {
    it('should delete a sink', function (done) {
      program.deleteSink(sinkName, function (err) {
        assert.ifError(err);

        program.getSinkMetadata(sinkName, function (err) {
          assert(err, 'Should be an error.');
          assert.equal(err.code, 404, 'Should be a "not found" error.');
          done();
        });
      });
    });
  });
});
