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

// [START all]
/**
 * Command-line application to perform an synchronous query in BigQuery.
 *
 * This sample is used on this page:
 *
 *   https://cloud.google.com/bigquery/querying-data
 *
 * For more information, see the README.md under /bigquery.
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
 * @param {string} query The BigQuery query to run, as a string.
 * @param {function} callback Callback function to receive query results.
 */
function syncQuery (query, callback) {
  if (!query) {
    return callback(new Error('"query" is required!'));
  }

  // Construct query object.
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var queryObj = {
    query: query,
    timeoutMs: 10000 // Time out after 10 seconds.
  };

  // Run query
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
 * @param {string} query The BigQuery query to run, as a string.
 * @param {function} callback Callback function to receive job data.
 */
function asyncQuery (query, callback) {
  if (!query) {
    return callback(new Error('"query" is required!'));
  }

  // Construct query object
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var queryObj = {
    query: query
  };

  // Submit query asynchronously
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
    return callback(new Error('"jobId" is required!'));
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
      return callback(new Error('Job %s is not done', jobId));
    }
  });
}
// [END async_query]
// [END all]

// The command-line program
var cli = require('yargs');
var makeHandler = require('../utils').makeHandler;

var program = module.exports = {
  asyncQuery: asyncQuery,
  asyncPoll: asyncPoll,
  syncQuery: syncQuery,
  bigquery: bigquery,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('sync <query>', 'Run a synchronous query.', {}, function (options) {
    program.syncQuery(options.query, makeHandler());
  })
  .command('async <query>', 'Start an asynchronous query.', {}, function (options) {
    program.asyncQuery(options.query, makeHandler());
  })
  .command('poll <jobId>', 'Get the status of a job.', {}, function (options) {
    program.asyncPoll(options.jobId, makeHandler());
  })
  .example('node $0 sync "SELECT * FROM publicdata:samples.natality LIMIT 5;"')
  .example('node $0 async "SELECT * FROM publicdata:samples.natality LIMIT 5;"')
  .example('node $0 poll 12345')
  .wrap(80)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/bigquery/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
