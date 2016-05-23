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

var request = require('request');

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
 * Load a csv file from a Google Cloud Storage bucket into a BigQuery table.
 *
 * @param {string} bucket Cloud Storage bucket.
 * @param {string} file Csv file to load.
 * @param {string} datasetId The dataset.
 * @param {string} tableName The table.
 * @param {Function} callback Callback function.
 */
function loadDataFromCsvExample (bucket, file, datasetId, tableName, callback) {
  if (!bucket || typeof bucket !== 'string') {
    throw new Error('bucket is required!');
  }
  if (!file || typeof file !== 'string') {
    throw new Error('file is required!');
  }
  if (!datasetId || typeof datasetId !== 'string') {
    throw new Error('datasetId is required!');
  }
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('tableName is required!');
  }

  var dataset = bigquery.dataset(datasetId);
  var table = dataset.table(tableName);

  var options = {
    skipLeadingRows: 0
  };

  var url = 'https://storage.googleapis.com/' + bucket + '/' + file;

  request.get(url)
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

// Run the examples
exports.main = function (bucket, file, datasetId, tableName, cb) {
  loadDataFromCsvExample(bucket, file, datasetId, tableName, cb);
};

if (module === require.main) {
  var args = process.argv.slice(2);
  exports.main(
    args[0],
    args[1],
    args[2],
    args[3],
    console.log
  );
}
