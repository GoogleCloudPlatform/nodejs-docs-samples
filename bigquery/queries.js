/**
 * Copyright 2017, Google, Inc.
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
function printResult (rows) {
  // [START bigquery_simple_app_print]
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
  // [END bigquery_simple_app_print]
}

function queryShakespeare (projectId) {
  // [START bigquery_simple_app_query]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The SQL query to run
  const sqlQuery = `SELECT
    corpus, COUNT(*) as unique_words
    FROM publicdata.samples.shakespeare
    GROUP BY
      corpus
    ORDER BY
    unique_words DESC LIMIT 10;`;

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  // Runs the query
  bigquery
    .query(options)
    .then((results) => {
      const rows = results[0];
      printResult(rows);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_simple_app_query]
}
// [END bigquery_simple_app_all]

function syncQuery (sqlQuery, projectId) {
  // [START bigquery_sync_query]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The SQL query to run, e.g. "SELECT * FROM publicdata.samples.natality LIMIT 5;"
  // const sqlQuery = "SELECT * FROM publicdata.samples.natality LIMIT 5;";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    timeoutMs: 10000, // Time out after 10 seconds.
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  // Runs the query
  bigquery
    .query(options)
    .then((results) => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach((row) => console.log(row));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_sync_query]
}

function asyncQuery (sqlQuery, projectId) {
  // [START bigquery_async_query]
  // [START bigquery_build_client]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });
  // [END bigquery_build_client]

  // The SQL query to run, e.g. "SELECT * FROM publicdata.samples.natality LIMIT 5;"
  // const sqlQuery = "SELECT * FROM publicdata.samples.natality LIMIT 5;";

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  let job;

  // Runs the query as a job
  bigquery
    .startQuery(options)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then((results) => {
      // Get the job's status
      return job.getMetadata();
    })
    .then((metadata) => {
      // Check the job's status for errors
      const errors = metadata[0].status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
      return job.getQueryResults();
    })
    .then((results) => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach((row) => console.log(row));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_async_query]
}

const cli = require(`yargs`)
  .demand(1)
  .options({
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description: 'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string'
    }
  })
  .command(
    `sync <sqlQuery>`,
    `Run the specified synchronous query.`,
    {},
    (opts) => syncQuery(opts.sqlQuery, opts.projectId)
  )
  .command(
    `async <sqlQuery>`,
    `Start the specified asynchronous query.`,
    {},
    (opts) => asyncQuery(opts.sqlQuery, opts.projectId)
  )
  .command(
    `shakespeare`,
    `Queries a public Shakespeare dataset.`,
    {},
    (opts) => queryShakespeare(opts.projectId)
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
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
