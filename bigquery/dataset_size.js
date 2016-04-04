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

var async = require('async');

// [START auth]
// You must set the GOOGLE_APPLICATION_CREDENTIALS and GCLOUD_PROJECT
// environment variables to run this sample
var projectId = process.env.GCLOUD_PROJECT;

// Initialize gcloud
var gcloud = require('gcloud')({
  projectId: projectId
});

// Get a reference to the bigquery component
var bigquery = gcloud.bigquery();
// [END auth]

// not going to use this bigquery instance
bigquery = undefined;

// [START list_tables]
/**
 * Retrieve all tables for the specified dataset.
 *
 * @param {Object} bigquery gcloud-node bigquery client.
 * @param {string} datasetId Dataset of the tables to retrieve.
 * @param {string} [pageToken] Page to retrieve.
 * @param {Function} callback Callback function.
 */
function getAllTablesExample(bigquery, datasetId, pageToken, callback) {
  if (typeof pageToken === 'function') {
    callback = pageToken;
    pageToken = undefined;
  }
  var dataset = bigquery.dataset(datasetId);
  var options = {};
  if (pageToken) {
    options.pageToken = pageToken;
  }

  // Grab paginated tables
  dataset.getTables(options, function (err, tables, nextQuery) {
    // Quit on error
    if (err) {
      return callback(err);
    }

    // There is another page of tables
    if (nextQuery) {
      // Grab the remaining pages of tables recursively
      return getAllTablesExample(
        datasetId,
        nextQuery.token,
        function (err, _tables) {
          if (err) {
            return callback(err);
          }
          callback(null, tables.concat(_tables));
        }
      );
    }
    // Last page of tables
    return callback(null, tables);
  });
}
// [END list_tables]

// [START get_size]
/**
 * Retrieve the size of the specified dataset.
 *
 * @param {string} projectId The project, .e.g. "bigquery-public-data"
 * @param {string} datasetId The dataset, e.g. "hacker_news"
 * @param {Function} callback Callback function.
 */
function getSizeExample(projectId, datasetId, callback) {
  if (!projectId) {
    return callback(new Error('projectId is required!'));
  }
  if (!datasetId) {
    return callback(new Error('datasetId is require!'));
  }

  var gcloud = require('gcloud')({
    projectId: projectId || process.env.GCLOUD_PROJECT
  });
  var bigquery = gcloud.bigquery();

  // Fetch all tables in the dataset
  getAllTablesExample(bigquery, datasetId, function (err, tables) {
    return async.parallel(tables.map(function (table) {
      return function (cb) {
        // Fetch more detailed info for each table
        table.get(function (err, tableInfo) {
          if (err) {
            return cb(err);
          }
          // Return numBytes converted to Megabytes
          var numBytes = tableInfo.metadata.numBytes;
          return cb(null, (parseInt(numBytes, 10) / 1000) / 1000);
        });
      };
    }), function (err, sizes) {
      if (err) {
        return callback(err);
      }
      var sum = sizes.reduce(function (cur, prev) {
        return cur + prev;
      }, 0);
      return callback(null, sum);
    });
  });
}
// [END get_size]

// Run the examples
exports.main = function (projectId, datasetId, cb) {
  getSizeExample(projectId, datasetId, function (err, sum) {
    if (err) {
      return cb(err);
    }
    var size = 'MB';
    if (sum > 1000) {
      sum = sum / 1000;
      size = 'GB';
    }
    if (sum > 1000) {
      sum = sum / 1000;
      size = 'TB';
    }
    cb(null, '' + sum.toPrecision(5) + ' ' + size);
  });
};

if (module === require.main) {
  var args = process.argv.slice(2);
  if (args.length !== 2) {
    throw new Error('Usage: node dataset_size.js <projectId> <datasetId>');
  }
  exports.main(
    args[0],
    args[1],
    console.log
  );
}
