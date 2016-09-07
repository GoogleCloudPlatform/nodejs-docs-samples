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

// [START complete]
// [START setup]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var BigQuery = require('@google-cloud/bigquery');
// [END setup]

function printExample (rows) {
  console.log('Query Results:');
  rows.forEach(function (row) {
    var str = '';
    for (var key in row) {
      if (str) {
        str += '\n';
      }
      str += key + ': ' + row[key];
    }
    console.log(str);
  });
}

function queryShakespeare (callback) {
  var bigquery = BigQuery();

  var sqlQuery = 'SELECT\n' +
                 '  TOP(corpus, 10) as title,\n' +
                 '  COUNT(*) as unique_words\n' +
                 'FROM `publicdata.samples.shakespeare`;';

  // Construct query object.
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var options = {
    query: sqlQuery,

    // Use standard SQL syntax for queries.
    // See: https://cloud.google.com/bigquery/sql-reference/
    useLegacySql: false
  };

  // Run the query
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery?method=query
  bigquery.query(options, function (err, rows) {
    if (err) {
      return callback(err);
    }

    // Print the result
    printExample(rows);

    return callback(null, rows);
  });
}
// [END complete]

function syncQuery (sqlQuery, callback) {
  var bigquery = BigQuery();

  // Construct query object.
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var options = {
    query: sqlQuery,

    // Time out after 10 seconds.
    timeoutMs: 10000,

    // Use standard SQL syntax for queries.
    // See: https://cloud.google.com/bigquery/sql-reference/
    useLegacySql: false
  };

  // Run the query
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery?method=query
  bigquery.query(options, function (err, rows) {
    if (err) {
      return callback(err);
    }

    console.log('Received %d row(s)!', rows.length);
    return callback(null, rows);
  });
}

function waitForJob (jobId, callback) {
  var bigquery = BigQuery();

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/job
  var job = bigquery.job(jobId);

  job
    .on('error', callback)
    .on('complete', function (metadata) {
      // The job is done, get query results
      // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/job?method=getQueryResults
      job.getQueryResults(function (err, rows) {
        if (err) {
          return callback(err);
        }

        console.log('Job complete, received %d row(s)!', rows.length);
        return callback(null, rows);
      });
    });
}

function asyncQuery (sqlQuery, callback) {
  var bigquery = BigQuery();

  // Construct query object
  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  var options = {
    query: sqlQuery,

    // Use standard SQL syntax for queries.
    // See: https://cloud.google.com/bigquery/sql-reference/
    useLegacySql: false
  };

  // Run the query asynchronously
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery?method=startQuery
  bigquery.startQuery(options, function (err, job) {
    if (err) {
      return callback(err);
    }

    console.log('Started job: %s', job.id);
    return waitForJob(job.id, callback);
  });
}

// The command-line program
var cli = require('yargs');
var makeHandler = require('../utils').makeHandler;

var program = module.exports = {
  printExample: printExample,
  queryShakespeare: queryShakespeare,
  asyncQuery: asyncQuery,
  waitForJob: waitForJob,
  syncQuery: syncQuery,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('sync <sqlQuery>', 'Run the specified synchronous query.', {}, function (options) {
    program.syncQuery(options.sqlQuery, makeHandler());
  })
  .command('async <sqlQuery>', 'Start the specified asynchronous query.', {}, function (options) {
    program.asyncQuery(options.sqlQuery, makeHandler());
  })
  .command('wait <jobId>', 'Wait for the specified job to complete and retrieve its results.', {}, function (options) {
    program.waitForJob(options.jobId, makeHandler());
  })
  .example('node $0 sync "SELECT * FROM `publicdata.samples.natality` LIMIT 5;"')
  .example('node $0 async "SELECT * FROM `publicdata.samples.natality` LIMIT 5;"')
  .example('node $0 wait job_VwckYXnR8yz54GBDMykIGnrc2')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/bigquery/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
