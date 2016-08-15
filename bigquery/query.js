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
/**
 * Command-line application to perform an synchronous query in BigQuery.
 *
 * This sample is used on this page:
 *
 *   https://cloud.google.com/bigquery/querying-data#syncqueries
 */

'use strict';

// [START auth]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var BigQuery = require('@google-cloud/bigquery');

// Instantiate the bigquery client
var bigquery = BigQuery();
// [END auth]

// [START sync_query]
/**
 * Run a synchronous query.
 * @param {string} query The BigQuery query to run, as a string
 * @param {function} callback Callback function to receive query results.
 */
function syncQuery (query, callback) {
  if (!query || typeof query !== 'string') {
    return callback(Error('"query" is required, and must be a string!'));
  }

  // Construct query object
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var queryObj = {
    query: query,
    timeoutMs: 10000 // Time out after 10 seconds
  };

  bigquery.query(queryObj, function (err, rows) {
    if (err) {
      return callback(err);
    }

    console.log('SyncQuery: found %d rows!', rows.length);
    return callback(null, rows);
  });
}
// [END sync_query]

// [START async_query]
/**
 * Run an asynchronous query.
 * @param {string} query The BigQuery query to run, as a string
 * @param {function} callback Callback function to receive job data.
 */
function asyncQuery (query, callback) {
  if (!query || typeof query !== 'string') {
    return callback(Error('"query" is required, and must be a string!'));
  }

  // Construct query object
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var queryObj = {
    query: query
  };

  bigquery.startQuery(queryObj, function (err, job) {
    if (err) {
      return callback(err);
    }

    console.log('AsyncQuery: submitted job %s!', job.id);
    return callback(null, job);
  });
}

/**
 * Poll an asynchronous query job for results.
 * @param {object} jobId The ID of the BigQuery job to poll.
 * @param {function} callback Callback function to receive query results.
 */
function asyncPoll (jobId, callback) {
  if (!jobId) {
    return callback(Error('"jobId" is required!'));
  }

  // Check for job status
  var job = bigquery.job(jobId);
  job.getMetadata(function (err, metadata) {
    if (err) {
      return callback(err);
    }
    console.log('Job status: %s', metadata.status.state);

    // If job is done, get query results; if not, return an error.
    if (metadata.status.state === 'DONE') {
      job.getQueryResults(function (err, rows) {
        if (err) {
          return callback(err);
        }

        console.log('AsyncQuery: polled job %s; got %d rows!', jobId, rows.length);
        return callback(null, rows);
      });
    } else {
      return callback(Error('Job %s is not done', jobId));
    }
  });
}
// [END async_query]

// [START usage]
function printUsage () {
  console.log('Usage:');
  console.log('\nCommands:\n');
  console.log('\tnode query sync QUERY');
  console.log('\tnode query async QUERY');
  console.log('\tnode query poll JOB_ID');
  console.log('\nExamples:\n');
  console.log('\tnode query sync "SELECT * FROM publicdata:samples.natality LIMIT 5;"');
  console.log('\tnode query async "SELECT * FROM publicdata:samples.natality LIMIT 5;"');
  console.log('\tnode query poll 12345');
}
// [END usage]

// The command-line program
var program = {
  // Print usage instructions
  printUsage: printUsage,

  // Exports
  asyncQuery: asyncQuery,
  asyncPoll: asyncPoll,
  syncQuery: syncQuery,
  bigquery: bigquery,

  // Run the sample
  main: function (args, cb) {
    var command = args.shift();
    var arg = args.shift();
    if (command === 'sync') {
      this.syncQuery(arg, cb);
    } else if (command === 'async') {
      this.asyncQuery(arg, cb);
    } else if (command === 'poll') {
      this.asyncPoll(arg, cb);
    } else {
      this.printUsage();
    }
  }
};

if (module === require.main) {
  program.main(process.argv.slice(2), console.log);
}
// [END complete]

module.exports = program;
