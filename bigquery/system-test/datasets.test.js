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

var BigQuery = require('@google-cloud/bigquery');
var uuid = require('node-uuid');
var program = require('../datasets');

var bigquery = BigQuery();
var projectId = process.env.GCLOUD_PROJECT;
var datasetId = 'nodejs-docs-samples-test-' + uuid.v4();

// BigQuery only accepts underscores
datasetId = datasetId.replace(/-/gi, '_');

describe('bigquery:datasets', function () {
  after(function (done) {
    bigquery.dataset(datasetId).delete({
      force: true
    }, function () {
      // Ignore any error, the dataset might already have been successfully deleted
      done();
    });
  });

  describe('createDataset', function () {
    it('should create a new dataset', function (done) {
      program.createDataset(datasetId, function (err, dataset, apiResponse) {
        assert.equal(err, null);
        assert.notEqual(dataset, undefined);
        assert.equal(dataset.id, datasetId);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Created dataset: %s', datasetId]);
        assert.notEqual(apiResponse, undefined);

        done();
      });
    });
  });

  describe('listDatasets', function () {
    it('should list datasets', function (done) {
      program.listDatasets(projectId, function (err, datasets) {
        assert.equal(err, null);
        assert(Array.isArray(datasets));
        assert(datasets.length > 0);
        var matchingDatasets = datasets.filter(function (dataset) {
          return dataset.id === datasetId;
        });
        assert.equal(matchingDatasets.length, 1, 'newly created dataset is in list');
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d dataset(s)!', datasets.length]);

        done();
      });
    });
  });

  describe('getDatasetSize', function () {
    it('should return the size of a dataset', function (done) {
      program.getDatasetSize(datasetId, projectId, function (err, size) {
        assert.equal(err, null);
        assert.equal(typeof size, 'number', 'should have received a number');
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Size of %s: %d MB', datasetId, size]);

        done();
      });
    });
  });

  describe('deleteDataset', function () {
    it('should list datasets', function (done) {
      program.deleteDataset(datasetId, function (err) {
        assert.equal(err, null);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Deleted dataset: %s', datasetId]);

        done();
      });
    });
  });
});
