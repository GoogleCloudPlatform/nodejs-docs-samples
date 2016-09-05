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
  bucket: generateUuid(),
  file: 'data.json',
  dataset: generateUuid(),
  table: generateUuid(),
  schema: 'Name:string, Age:integer, Weight:float, IsMagic:boolean',
  rows: rows
};
var srcDataset = options.dataset;
var srcTable = options.table;
var destDataset = generateUuid();
var destTable = generateUuid();

describe('bigquery:tables', function () {
  before(function (done) {
    // Create bucket
    storage.createBucket(options.bucket, function (err, bucket) {
      assert.ifError(err, 'bucket creation succeeded');
      // Upload data.csv
      bucket.upload(options.localFilePath, function (err) {
        assert.ifError(err, 'file upload succeeded');
        // Create srcDataset
        bigquery.createDataset(srcDataset, function (err) {
          assert.ifError(err, 'srcDataset creation succeeded');
          // Create destDataset
          bigquery.createDataset(destDataset, function (err) {
            assert.ifError(err, 'destDataset creation succeeded');
            done();
          });
        });
      });
    });
  });

  after(function (done) {
    // Delete srcDataset
    bigquery.dataset(srcDataset).delete({ force: true }, function () {
      // Delete destDataset
      bigquery.dataset(destDataset).delete({ force: true }, function () {
        // Delete files
        storage.bucket(options.bucket).deleteFiles({ force: true }, function (err) {
          if (err) {
            return done(err);
          }
          // Delete bucket
          setTimeout(function () {
            storage.bucket(options.bucket).delete(done);
          }, 2000);
        });
      });
    });
  });

  describe('createTable', function () {
    it('should create a new table', function (done) {
      program.createTable(options, function (err, table) {
        assert.ifError(err);
        assert(table, 'new table was created');
        assert.equal(table.id, options.table);
        assert(console.log.calledWith('Created table: %s', options.table));
        done();
      });
    });
  });

  describe('listTables', function () {
    it('should list tables', function (done) {
      program.listTables(options, function (err, tables) {
        assert.ifError(err);
        assert(Array.isArray(tables));
        assert(tables.length > 0);
        assert(tables[0].id);
        var matchingTables = tables.filter(function (table) {
          return table.id === options.table;
        });
        assert.equal(matchingTables.length, 1, 'newly created table is in list');
        assert(console.log.calledWith('Found %d table(s)!', tables.length));
        done();
      });
    });
  });

  describe('import', function () {
    it('should import local file', function (done) {
      program.importFile({
        file: options.localFilePath,
        projectId: options.projectId,
        dataset: options.dataset,
        table: options.table
      }, function (err, metadata) {
        assert.ifError(err);
        assert(metadata, 'got metadata');
        assert.deepEqual(metadata.status, {
          state: 'DONE'
        }, 'job completed');
        done();
      });
    });
  });

  describe('exportTableToGCS', function () {
    it('should export data to GCS', function (done) {
      program.exportTableToGCS(options, function (err, metadata) {
        assert.ifError(err, 'no error occurred');
        assert(metadata, 'job metadata was received');
        assert(metadata.status, 'job metadata has status');
        assert.equal(metadata.status.state, 'DONE', 'job was finished');

        storage.bucket(options.bucket).file(options.file).exists(function (err, exists) {
          assert.ifError(err, 'file existence check succeeded');
          assert(exists, 'export destination exists');
          done();
        });
      });
    });
  });

  describe('insertRowsAsStream', function () {
    it('should insert rows into a table', function (done) {
      var table = bigquery.dataset(options.dataset).table(options.table);
      table.getRows({}, function (err, startRows) {
        assert.equal(err, null);

        program.insertRowsAsStream(options, function (err, insertErrors) {
          assert.equal(err, null);
          assert.deepEqual(insertErrors, [], 'no per-row insert errors occurred');

          setTimeout(function () {
            table.getRows({}, function (err, endRows) {
              assert.equal(err, null);
              assert.equal(startRows.length + 2, endRows.length, 'insertRows() added 2 rows');
              done();
            });
          }, 2000);
        });
      });
    });
  });

  describe('copyTable', function () {
    it('should copy a table between datasets', function (done) {
      program.copyTable(srcDataset, srcTable, destDataset, destTable, function (err, metadata) {
        assert.equal(err, null);
        assert.deepEqual(metadata.status, { state: 'DONE' });

        bigquery.dataset(srcDataset).table(srcTable).exists(
          function (err, exists) {
            assert.equal(err, null);
            assert.equal(exists, true, 'srcTable exists');

            bigquery.dataset(destDataset).table(destTable).exists(
              function (err, exists) {
                assert.equal(err, null);
                assert.equal(exists, true, 'destTable exists');
                done();
              }
            );
          }
        );
      });
    });
  });

  describe('browseRows', function () {
    it('should display rows in a table', function (done) {
      program.browseRows(options.dataset, options.table, function (err, rows) {
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
      program.deleteTable(options, function (err) {
        assert.ifError(err);
        assert(console.log.calledWith('Deleted table: %s', options.table));
        done();
      });
    });
  });
});
