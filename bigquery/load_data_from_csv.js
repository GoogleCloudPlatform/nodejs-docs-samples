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

// [START complete]
'use strict';

var fs = require('fs');
var path = require('path');

// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var gcloud = require('gcloud');

// Get a reference to the bigquery component
var bigquery = gcloud.bigquery();

/**
 * Wait for the provided job to complete.
 *
 * @param {Object} job The job to watch.
 * @param {number} timeout Maximum time to wait (milliseconds).
 * @param {Function} Callback function.
 */
function pollJobUntilDone (job, timeout, timeWaited, callback) {
  job.getMetadata(function (err, metadata) {
    if (err) {
      return callback(err);
    }
    if (timeWaited > timeout) {
      return callback(new Error('Timed out waiting for job to complete'));
    }
    if (metadata.status && (metadata.status.state === 'RUNNING' ||
      metadata.status.state === 'PENDING')) {
      setTimeout(function () {
        console.log('working...');
        pollJobUntilDone(job, timeout, timeWaited + 5000, callback);
      }, 5000);
    } else {
      callback(null, metadata);
    }
  });
}

/**
 * Load a csv file into a BigQuery table.
 *
 * @param {string} pathToCsvFile Path to csv file to load.
 * @param {string} datasetId The dataset.
 * @param {string} tableName The table.
 * @param {Function} callback Callback function.
 */
function loadDataFromCsvExample (pathToCsvFile, datasetId, tableName, callback) {
  if (!pathToCsvFile || typeof pathToCsvFile !== 'string') {
    return callback(new Error('pathToCsvFile is required!'));
  }
  if (!datasetId || typeof datasetId !== 'string') {
    return callback(new Error('datasetId is require!'));
  }
  if (!tableName || typeof tableName !== 'string') {
    return callback(new Error('tableName is require!'));
  }

  var dataset = bigquery.dataset(datasetId);
  var table = dataset.table(tableName);

  var options = {
    skipLeadingRows: 0
  };

  fs.createReadStream(pathToCsvFile)
    .pipe(table.createWriteStream(options))
    .on('complete', function (job) {
      // Wait up to 60 seconds for job to complete
      pollJobUntilDone(job, 60000, 0, function (err, metadata) {
        if (err) {
          return callback(err);
        }
        console.log('job completed', metadata);
        callback(null, metadata);
      });
    });
}
// [END complete]

exports.createTable = function (datasetId, tableName, callback) {
  var dataset = bigquery.dataset(datasetId);
  var pathToSchemaFile = path.join(__dirname, '/resources/schema.json');
  fs.readFile(pathToSchemaFile, { encoding: 'utf8' }, function (err, file) {
    if (err) {
      return callback(err);
    }
    var schema = JSON.parse(file);
    var columns = schema.map(function (column) {
      return column.name + ':' + column.type;
    });
    dataset.createTable(tableName, { schema: columns.join(',') }, callback);
  });
};

exports.deleteTable = function (datasetId, tableName, callback) {
  var dataset = bigquery.dataset(datasetId);
  var table = dataset.table(tableName);
  table.delete(callback);
};

// Run the examples
exports.main = function (pathToCsvFile, datasetId, tableName, cb) {
  loadDataFromCsvExample(pathToCsvFile, datasetId, tableName, cb);
};

if (module === require.main) {
  var args = process.argv.slice(2);
  exports.main(
    args[0],
    args[1],
    args[2],
    console.log
  );
}
