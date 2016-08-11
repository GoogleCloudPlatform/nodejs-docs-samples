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

/**
 * [START complete]
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
var gcloud = require('gcloud');

// Instantiate the bigquery client
var bigquery = gcloud.bigquery();
// [END auth]

// [START query]
/**
 * Run an example synchronous query.
 * @param {object} queryObj The BigQuery query to run, plus any additional options
 *        listed at https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
 * @param {function} callback Callback function.
 */
function syncQuery (queryObj, callback) {
  if (!queryObj || !queryObj.query) {
    return callback(Error('queryObj must be an object with a "query" parameter'));
  }

  bigquery.query(queryObj, function (err, rows) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d rows!', rows.length);
    return callback(null, rows);
  });
}
// [END query]
// [START usage]
function printUsage () {
  console.log('Usage: node sync_query QUERY');
  console.log('\nExamples:\n');
  console.log('\tnode sync_query "SELECT * FROM publicdata:samples.natality LIMIT 5;"');
}
// [END usage]

// The command-line program
var program = {
  // Print usage instructions
  printUsage: printUsage,

  // Exports
  syncQuery: syncQuery,
  bigquery: bigquery,

  // Run the sample
  main: function (args, cb) {
    if (args.length === 1 && !(args[0] === '-h' || args[0] === '--help')) {
      var queryObj = { query: args[0], timeoutMs: 10000 };
      this.syncQuery(queryObj, cb);
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
