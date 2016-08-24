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

var uuid = require('node-uuid');
var generateUuid = function () {
  return 'nodejs_docs_samples_' + uuid.v4().replace(/-/gi, '_');
};
var example = require('../tables');
var options = {
  bucket: generateUuid(),
  file: 'data.json',
  dataset: generateUuid(),
  table: generateUuid()
};
var bigquery = require('@google-cloud/bigquery')();
var storage = require('@google-cloud/storage')();
var file = storage.bucket(options.bucket).file(options.file);

describe('bigquery:tables', function () {
  before(function (done) {
    // Create bucket
    storage.createBucket(options.bucket, function (err, bucket) {
      assert.ifError(err, 'bucket creation succeeded');

      // Create dataset
      bigquery.createDataset(options.dataset, function (err, dataset) {
        assert.ifError(err, 'dataset creation succeeded');

        // Create table
        dataset.createTable(
          options.table,
          { schema: 'name:string, age:integer' },
          function (err, table) {
            assert.ifError(err, 'table creation succeeded');
            done();
          }
        );
      });
    });
  });
  after(function (done) {
    // Delete testing dataset/table
    bigquery.dataset(options.dataset).delete({ force: true }, function () {
      // Delete files
      storage.bucket(options.bucket).deleteFiles({ force: true }, function (err) {
        if (err) {
          return done(err);
        }
        // Delete bucket
        storage.bucket(options.bucket).delete(done);
      });
    });
  });

  describe('export_table_to_gcs', function () {
    it('should export data to GCS', function (done) {
      example.exportTableToGCS(options, function (err, metadata) {
        assert.ifError(err, 'no error occurred');
        assert(metadata, 'job metadata was received');
        assert(metadata.status, 'job metadata has status');
        assert.equal(metadata.status.state, 'DONE', 'job was finished');

        file.exists(function (err, exists) {
          assert.ifError(err, 'file existence check succeeded');
          assert(exists, 'export destination exists');
          done();
        });
      });
    });
  });
});
