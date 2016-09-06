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

var bigquery = require('@google-cloud/bigquery')();
var storage = require('@google-cloud/storage')();
var uuid = require('node-uuid');
var program = require('../tables');
var path = require('path');

function generateUuid () {
  return 'nodejs_docs_samples_' + uuid.v4().replace(/-/gi, '_');
}

var rows = [
  { Name: 'foo', Age: 27, Weight: 80.3, IsMagic: true },
  { Name: 'bar', Age: 13, Weight: 54.6, IsMagic: false }
];
var options = {
  projectId: process.env.GCLOUD_PROJECT,
  localFilePath: path.join(__dirname, '../resources/data.csv'),
  bucketName: generateUuid(),
  fileName: 'data.json',
  datasetId: generateUuid(),
  tableId: generateUuid(),
  schema: 'Name:string, Age:integer, Weight:float, IsMagic:boolean',
  rows: rows
};
var srcDatasetId = options.datasetId;
var srcTableId = options.tableId;
var destDatasetId = generateUuid();
var destTableId = generateUuid();

describe.only('bigquery:tables', function () {
  before(function (done) {
    // Create bucket
    storage.createBucket(options.bucketName, function (err, bucket) {
      assert.ifError(err, 'bucket creation succeeded');
      // Upload data.csv
      bucket.upload(options.localFilePath, function (err) {
        assert.ifError(err, 'file upload succeeded');
        // Create srcDataset
        bigquery.createDataset(srcDatasetId, function (err) {
          assert.ifError(err, 'srcDataset creation succeeded');
          // Create destDataset
          bigquery.createDataset(destDatasetId, function (err) {
            assert.ifError(err, 'destDataset creation succeeded');
            done();
          });
        });
      });
    });
  });

  after(function (done) {
    // Delete srcDataset
    bigquery.dataset(srcDatasetId).delete({ force: true }, function () {
      // Delete destDataset
      bigquery.dataset(destDatasetId).delete({ force: true }, function () {
        // Delete files
        storage.bucket(options.bucketName).deleteFiles({ force: true }, function (err) {
          if (err) {
            return done(err);
          }
          // Delete bucket
          setTimeout(function () {
            storage.bucket(options.bucketName).delete(done);
          }, 2000);
        });
      });
    });
  });

  describe('createTable', function () {
    it('should create a new table', function (done) {
      program.createTable(options.datasetId, options.tableId, options.schema, function (err, table) {
        assert.equal(err, null);
        assert.notEqual(table, undefined);
        assert.equal(table.id, options.tableId);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Created table %s in %s', options.tableId, options.datasetId]);

        // Listing is eventually consistent, give the index time to update
        setTimeout(done, 5000);
      });
    });
  });

  describe('listTables', function () {
    it('should list tables', function (done) {
      program.listTables(options.datasetId, function (err, tables) {
        assert.equal(err, null);
        assert(Array.isArray(tables));
        assert(tables.length > 0);
        var matchingTables = tables.filter(function (table) {
          return table.id === options.tableId;
        });
        assert.equal(matchingTables.length, 1, 'newly created table is in list');
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d table(s)!', tables.length]);

        done();
      });
    });
  });

  describe('importLocalFile', function () {
    it('should import local file', function (done) {
      program.importLocalFile(options.datasetId, options.tableId, options.localFilePath, function (err, metadata, apiResponse) {
        assert.equal(err, null);
        assert(metadata, 'got metadata');
        assert.deepEqual(metadata.status, {
          state: 'DONE'
        }, 'job completed');
        assert.notEqual(apiResponse, undefined);

        done();
      });
    });
  });

  describe('exportTableToGCS', function () {
    it('should export data to GCS', function (done) {
      program.exportTableToGCS(options.datasetId, options.tableId, options.bucketName, options.fileName, function (err, metadata, apiResponse) {
        assert.equal(err, null);
        assert.notEqual(metadata, undefined);
        assert.notEqual(metadata.status, undefined);
        assert.deepEqual(metadata.status, { state: 'DONE' });
        assert.notEqual(apiResponse, undefined);

        storage.bucket(options.bucketName).file(options.fileName).exists(function (err, exists) {
          assert.equal(err, null);
          assert.equal(exists, true);

          done();
        });
      });
    });
  });

  describe('insertRowsAsStream', function () {
    it('should insert rows into a table', function (done) {
      var table = bigquery.dataset(options.datasetId).table(options.tableId);

      table.getRows(function (err, startRows) {
        assert.equal(err, null);

        program.insertRowsAsStream(options.datasetId, options.tableId, options.rows, function (err, insertErrors, apiResponse) {
          assert.equal(err, null);
          assert.deepEqual(insertErrors, []);
          assert.notEqual(apiResponse, undefined);

          setTimeout(function () {
            table.getRows(function (err, endRows) {
              assert.equal(err, null);
              assert.equal(startRows.length + 2, endRows.length);

              done();
            });
          }, 2000);
        });
      });
    });
  });

  describe('copyTable', function () {
    it('should copy a table between datasets', function (done) {
      program.copyTable(srcDatasetId, srcTableId, destDatasetId, destTableId, function (err, metadata, apiResponse) {
        assert.equal(err, null);
        assert.notEqual(metadata, undefined);
        assert.deepEqual(metadata.status, { state: 'DONE' });
        assert.notEqual(apiResponse, undefined);

        bigquery.dataset(srcDatasetId).table(srcTableId).exists(function (err, exists) {
          assert.equal(err, null);
          assert.equal(exists, true);

          bigquery.dataset(destDatasetId).table(destTableId).exists(function (err, exists) {
            assert.equal(err, null);
            assert.equal(exists, true);

            done();
          });
        });
      });
    });
  });

  describe('browseRows', function () {
    it('should display rows in a table', function (done) {
      program.browseRows(options.datasetId, options.tableId, function (err, rows) {
        assert.equal(err, null);
        assert.equal(Array.isArray(rows), true);
        assert.equal(rows.length > 0, true);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d row(s)!', rows.length]);

        done();
      });
    });
  });

  describe('deleteTable', function () {
    it('should delete table', function (done) {
      program.deleteTable(options.datasetId, options.tableId, function (err) {
        assert.equal(err, null);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Deleted table %s from %s', options.tableId, options.datasetId]);

        done();
      });
    });
  });
});
