/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START bigquery_simple_app_all]
const BigQuery = require('@google-cloud/bigquery');

// [START bigquery_simple_app_print]
function printResult (rows) {
  console.log('Query Results:');
  rows.forEach(function (row) {
    let str = '';
    for (let key in row) {
      if (str) {
        str = `${str}\n`;
      }
      str = `${str}${key}: ${row[key]}`;
    }
    console.log(str);
  });
}
// [END bigquery_simple_app_print]

// [START bigquery_simple_app_query]
const sqlQuery = `SELECT
  corpus, COUNT(*) as unique_words
FROM publicdata.samples.shakespeare
GROUP BY
  corpus
ORDER BY
  unique_words DESC LIMIT 10;`;

function queryShakespeare () {
  // Instantiates a client
  const bigquery = BigQuery();

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  // Runs the query
  return bigquery.query(options)
    .then((results) => {
      const rows = results[0];
      printResult(rows);
      return rows;
    });
}
// [END bigquery_simple_app_query]
// [END bigquery_simple_app_all]

// [START bigquery_sync_query]
function syncQuery (sqlQuery) {
  // Instantiates a client
  const bigquery = BigQuery();

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    timeoutMs: 10000, // Time out after 10 seconds.
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  // Runs the query
  return bigquery.query(options)
    .then((results) => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach((row) => console.log(row));
      return rows;
    });
}
// [END bigquery_sync_query]

// [START bigquery_async_query]
function asyncQuery (sqlQuery) {
  // Instantiates a client
  const bigquery = BigQuery();

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  let job;

  // Runs the query as a job
  return bigquery.startQuery(options)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
      return job.getQueryResults();
    })
    .then((results) => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach((row) => console.log(row));
      return rows;
    });
}
// [END bigquery_async_query]

// The command-line program
const cli = require(`yargs`);

const program = module.exports = {
  queryShakespeare: queryShakespeare,
  asyncQuery: asyncQuery,
  syncQuery: syncQuery,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(
    `sync <sqlQuery>`,
    `Run the specified synchronous query.`,
    {},
    (opts) => program.syncQuery(opts.sqlQuery)
  )
  .command(
    `async <sqlQuery>`,
    `Start the specified asynchronous query.`,
    {},
    (opts) => program.asyncQuery(opts.sqlQuery)
  )
  .command(
    `shakespeare`,
    `Queries a public Shakespeare dataset.`,
    {},
    program.queryShakespeare
  )
  .example(
    `node $0 sync "SELECT * FROM publicdata.samples.natality LIMIT 5;"`,
    `Synchronously queries the natality dataset.`
  )
  .example(
    `node $0 async "SELECT * FROM publicdata.samples.natality LIMIT 5;"`,
    `Queries the natality dataset as a job.`
  )
  .example(
    `node $0 shakespeare`,
    `Queries a public Shakespeare dataset.`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
