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

// [START all]
// [START setup]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var BigQuery = require('@google-cloud/bigquery');
var Storage = require('@google-cloud/storage');

// Instantiate the BigQuery and Storage clients
var bigquery = BigQuery();
var storage = Storage();
// [END setup]

// [START create_table]
/**
 * Creates a new table with the given name in the specified dataset.
 *
 * @param {object} options Configuration options.
 * @param {string} options.dataset The dataset of the new table.
 * @param {string} options.table The name for the new table.
 * @param {string|object} [options.schema] The schema for the new table.
 * @param {function} cb The callback function.
 */
function createTable (options, callback) {
  // var table = bigquery.dataset(options.dataset).table(options.table);
  var dataset = bigquery.dataset(options.dataset);
  var config = {};
  if (options.schema) {
    config.schema = options.schema;
  }

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery/table
  dataset.createTable(options.table, config, function (err, table) {
    if (err) {
      return callback(err);
    }

    console.log('Created table: %s', options.table);
    return callback(null, table);
  });
}
// [END create_table]

// [START list_tables]
/**
 * List tables in the specified dataset.
 *
 * @param {object} options Configuration options.
 * @param {string} options.dataset The dataset of the new table.
 * @param {Function} callback Callback function.
 */
function listTables (options, callback) {
  var dataset = bigquery.dataset(options.dataset);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery/dataset
  dataset.getTables(function (err, tables) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d table(s)!', tables.length);
    return callback(null, tables);
  });
}
// [END list_tables]

// [START delete_table]
/**
 * Creates a new table with the given name in the specified dataset.
 *
 * @param {object} options Configuration options.
 * @param {string} options.dataset The dataset of the new table.
 * @param {string} options.table The name for the new table.
 * @param {function} cb The callback function.
 */
function deleteTable (options, callback) {
  var table = bigquery.dataset(options.dataset).table(options.table);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery/table
  table.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted table: %s', options.table);
    return callback(null);
  });
}
// [END delete_table]

// [START import_file]
/**
 * Load a csv file into a BigQuery table.
 *
 * @param {string} file Path to file to load.
 * @param {string} dataset The dataset.
 * @param {string} table The table.
 * @param {string} [format] The format of the file to be imported.
 * @param {function} callback The callback function.
 */
function importFile (options, callback) {
  var file;
  if (options.bucket) {
    // File is in Google Cloud Storage, e.g. gs://my-bucket/file.csv
    file = storage.bucket(options.bucket).file(options.file);
  } else {
    // File is local, e.g. ./data/file.csv
    file = options.file;
  }
  var table = bigquery.dataset(options.dataset).table(options.table);
  var config = {
    format: options.format
  };

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery/table?method=import
  table.import(file, config, function (err, job) {
    if (err) {
      console.log(err.stack);
      return callback(err);
    }

    console.log('Started job: %s', job.id);
    job
      .on('error', callback)
      .on('complete', function (metadata) {
        console.log('Completed job: %s', job.id);
        return callback(null, metadata);
      });
  });
}
// [END import_file]

// [START export_table_to_gcs]
/**
 * Export a table from BigQuery to Google Cloud Storage.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket A Google Cloud Storage bucket to use for storage.
 * @param {string} options.file The file to save results to within Google Cloud Storage.
 * @param {string} options.dataset The ID of the dataset to use.
 * @param {string} options.table The ID of the project to use.
 * @param {string} options.format Format to export as - either 'CSV', 'JSON', or 'AVRO'.
 * @param {boolean} [options.gzip] Optional. Whether or not data should be compressed using GZIP.
 * @param {function} callback Callback function to receive query results.
 */
function exportTableToGCS (options, callback) {
  var gcsFileObj = storage.bucket(options.bucket).file(options.file);
  var table = bigquery.dataset(options.dataset).table(options.table);
  var config = {
    format: options.format,
    gzip: options.gzip
  };

  // Export table
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery/table?method=export
  table.export(gcsFileObj, config, function (err, job) {
    if (err) {
      return callback(err);
    }
    console.log('Started job: %s', job.id);

    job
      .on('error', callback)
      .on('complete', function (metadata) {
        console.log('Completed job: %s', job.id);
        return callback(null, metadata);
      });
  });
}
// [END export_table_to_gcs]
// [END all]

// The command-line program
var cli = require('yargs');
var utils = require('../utils');

var program = module.exports = {
  createTable: createTable,
  listTables: listTables,
  deleteTable: deleteTable,
  importFile: importFile,
  exportTableToGCS: exportTableToGCS,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('create <dataset> <table>', 'Create a new table in the specified dataset.', {}, function (options) {
    program.createTable(utils.pick(options, ['dataset', 'table']), utils.makeHandler());
  })
  .command('list <dataset>', 'List tables in the specified dataset.', {}, function (options) {
    program.listTables(utils.pick(options, ['dataset']), utils.makeHandler(true, 'id'));
  })
  .command('delete <dataset> <table>', 'Delete a table in the specified dataset.', {}, function (options) {
    program.deleteTable(utils.pick(options, ['dataset', 'table']), utils.makeHandler());
  })
  .command('import <dataset> <table> <file>', 'Import data from a local file or a Google Cloud Storage file into BigQuery.', {
    bucket: {
      alias: 'b',
      requiresArg: true,
      description: 'Specify Cloud Storage bucket.',
      type: 'string'
    },
    format: {
      alias: 'f',
      requiresArg: true,
      type: 'string',
      choices: ['JSON', 'CSV', 'AVRO']
    }
  }, function (options) {
    program.importFile(utils.pick(options, ['dataset', 'table', 'file', 'format', 'bucket']), utils.makeHandler());
  })
  .command('export <dataset> <table> <bucket> <file>', 'Export a table from BigQuery to Google Cloud Storage.', {
    format: {
      alias: 'f',
      requiresArg: true,
      type: 'string',
      choices: ['JSON', 'CSV', 'AVRO']
    },
    gzip: {
      type: 'boolean',
      description: 'Whether to compress the exported table using gzip. Defaults to false.'
    }
  }, function (options) {
    program.exportTableToGCS(utils.pick(options, ['dataset', 'table', 'bucket', 'file', 'format', 'gzip']), utils.makeHandler());
  })
  .example(
    'node $0 create my_dataset my_table',
    'Create table "my_table" in "my_dataset".'
  )
  .example(
    'node $0 list my_dataset',
    'List tables in "my_dataset".'
  )
  .example(
    'node $0 delete my_dataset my_table',
    'Delete "my_table" from "my_dataset".'
  )
  .example(
    'node $0 import my_dataset my_table ./data.csv',
    'Import a local file into a table.'
  )
  .example(
    'node $0 import my_dataset my_table data.csv --bucket my-bucket',
    'Import a GCS file into a table.'
  )
  .example(
    'node $0 export my_dataset my_table my-bucket my-file',
    'Export my_dataset:my_table to gcs://my-bucket/my-file as raw CSV'
  )
  .example(
    'node $0 export my_dataset my_table my-bucket my-file -f JSON --gzip',
    'Export my_dataset:my_table to gcs://my-bucket/my-file as gzipped JSON'
  )
  .wrap(100)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/bigquery/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
