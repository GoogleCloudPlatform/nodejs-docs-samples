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

// [START setup]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/guides/authentication
var BigQuery = require('@google-cloud/bigquery');
// [END setup]

function createTable (datasetId, tableId, schema, callback) {
  var bigquery = BigQuery();
  var dataset = bigquery.dataset(datasetId);

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  var options = {
    schema: schema
  };

  // Create a new table in the given dataset
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/dataset?method=createTable
  dataset.createTable(tableId, options, function (err, table, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Created table %s in %s', tableId, datasetId);
    return callback(null, table, apiResponse);
  });
}

function listTables (datasetId, callback) {
  var bigquery = BigQuery();
  var dataset = bigquery.dataset(datasetId);

  // List the tables in the specified dataset
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/dataset?method=getTables
  dataset.getTables(function (err, tables) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d table(s)!', tables.length);
    return callback(null, tables);
  });
}

function browseRows (datasetId, tableId, callback) {
  var bigquery = BigQuery();
  var table = bigquery.dataset(datasetId).table(tableId);

  // Retreive rows from the specified table
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=getRows
  table.getRows(function (err, rows) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d row(s)!', rows.length);
    return callback(null, rows);
  });
}

function deleteTable (datasetId, tableId, callback) {
  var bigquery = BigQuery();
  var table = bigquery.dataset(datasetId).table(tableId);

  // Delete the specified table
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=delete
  table.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted table %s from %s', tableId, datasetId);
    return callback(null);
  });
}

function copyTable (srcDatasetId, srcTableId, destDatasetId, destTableId, callback) {
  var bigquery = BigQuery();

  var srcTable = bigquery.dataset(srcDatasetId).table(srcTableId);
  var destTable = bigquery.dataset(destDatasetId).table(destTableId);

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=copy
  srcTable.copy(destTable, function (err, job, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Started job: %s', job.id);
    job
      .on('error', callback)
      .on('complete', function (metadata) {
        console.log('Completed job: %s', job.id);
        return callback(null, metadata, apiResponse);
      });
  });
}

function importLocalFile (datasetId, tableId, fileName, callback) {
  var bigquery = BigQuery();
  var table = bigquery.dataset(datasetId).table(tableId);

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=import
  table.import(fileName, function (err, job, apiResponse) {
    if (err) {
      console.log(err.stack);
      return callback(err);
    }

    console.log('Started job: %s', job.id);
    job
      .on('error', callback)
      .on('complete', function (metadata) {
        console.log('Completed job: %s', job.id);
        return callback(null, metadata, apiResponse);
      });
  });
}

// [START import_file_from_gcs]
var Storage = require('@google-cloud/storage');

function importFileFromGCS (datasetId, tableId, bucketName, fileName, callback) {
  var bigquery = BigQuery();
  var storage = Storage();

  var table = bigquery.dataset(datasetId).table(tableId);
  var file = storage.bucket(bucketName).file(fileName);

  // Import the file from Google Cloud Storage
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=import
  table.import(file, function (err, job, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Started job: %s', job.id);
    job
      .on('error', callback)
      .on('complete', function (metadata) {
        console.log('Completed job: %s', job.id);
        return callback(null, metadata, apiResponse);
      });
  });
}
// [END import_file_from_gcs]

/* eslint-disable no-redeclare */
// [START export_table_to_gcs]
var Storage = require('@google-cloud/storage');

function exportTableToGCS (datasetId, tableId, bucketName, fileName, callback) {
  var bigquery = BigQuery();
  var storage = Storage();

  var table = bigquery.dataset(datasetId).table(tableId);
  var file = storage.bucket(bucketName).file(fileName);

  // Export a table to Google Cloud Storage
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=export
  table.export(file, function (err, job, apiResponse) {
    if (err) {
      return callback(err);
    }
    console.log('Started job: %s', job.id);

    job
      .on('error', callback)
      .on('complete', function (metadata) {
        console.log('Completed job: %s', job.id);
        return callback(null, metadata, apiResponse);
      });
  });
}
// [END export_table_to_gcs]
/* eslint-enable no-redeclare */

function insertRowsAsStream (datasetId, tableId, rows, callback) {
  var bigquery = BigQuery();
  var table = bigquery.dataset(datasetId).table(tableId);

  // Insert rows into a table
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=insert
  table.insert(rows, function (err, insertErrors, apiResponse) {
    if (err) {
      return callback(err);
    }
    console.log('Inserted %d row(s)!', rows.length);
    return callback(null, insertErrors, apiResponse);
  });
}

// The command-line program
var cli = require('yargs');
var utils = require('../utils');
var fs = require('fs');

var program = module.exports = {
  createTable: createTable,
  listTables: listTables,
  browseRows: browseRows,
  deleteTable: deleteTable,
  importLocalFile: importLocalFile,
  importFileFromGCS: importFileFromGCS,
  exportTableToGCS: exportTableToGCS,
  insertRowsAsStream: insertRowsAsStream,
  copyTable: copyTable,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('create <datasetId> <tableId>', 'Create a new table with the specified ID in the specified dataset.', {}, function (options) {
    program.createTable(options.datasetId, options.tableId, utils.makeHandler(false));
  })
  .command('list <datasetId>', 'List tables in the specified dataset.', {}, function (options) {
    program.listTables(options.datasetId, utils.makeHandler(true, 'id'));
  })
  .command('delete <datasetId> <tableId>', 'Delete the specified table from the specified dataset.', {}, function (options) {
    program.deleteTable(options.datasetId, options.tableId, utils.makeHandler(false));
  })
  .command('copy <srcDatasetId> <srcTableId> <destDatasetId> <destTableId>', 'Make a copy of an existing table.', {}, function (options) {
    program.copyTable(options.srcDatasetId, options.srcTableId, options.destDatasetId, options.destTableId, utils.makeHandler(false));
  })
  .command('browse <datasetId> <tableId>', 'List the rows from the specified table.', {}, function (options) {
    program.browseRows(options.datasetId, options.tableId, utils.makeHandler());
  })
  .command('import <datasetId> <tableId> <fileName>', 'Import data from a local file or a Google Cloud Storage file into the specified table.', {
    bucketName: {
      alias: 'b',
      requiresArg: true,
      description: 'Specify a Cloud Storage bucket.',
      type: 'string'
    }
  }, function (options) {
    if (options.bucketName) {
      program.importFileFromGCS(options.datasetId, options.tableId, options.bucketName, options.fileName, utils.makeHandler(false));
    } else {
      program.importLocalFile(options.datasetId, options.tableId, options.fileName, utils.makeHandler(false));
    }
  })
  .command('export <datasetId> <tableId> <bucketName> <fileName>', 'Export a table from BigQuery to Google Cloud Storage.', {}, function (options) {
    program.exportTableToGCS(options.datasetId, options.tableId, options.bucketName, options.fileName, utils.makeHandler(false));
  })
  .command('insert <datasetId> <tableId> <json_or_file>',
    'Insert a JSON array (as a string or newline-delimited file) into a BigQuery table.', {},
    function (options) {
      var content;
      try {
        content = fs.readFileSync(options.json_or_file);
      } catch (err) {
        content = options.json_or_file;
      }

      var rows = null;
      try {
        rows = JSON.parse(content);
      } catch (err) {}

      if (!Array.isArray(rows)) {
        throw new Error('"json_or_file" (or the file it points to) is not a valid JSON array.');
      }

      program.insertRowsAsStream(options.datasetId, options.tableId, rows, utils.makeHandler(false));
    }
  )
  .example(
    'node $0 create my_dataset my_table',
    'Create table "my_table" in "my_dataset".'
  )
  .example(
    'node $0 list my_dataset',
    'List tables in "my_dataset".'
  )
  .example(
    'node $0 browse my_dataset my_table',
    'Display rows from "my_table" in "my_dataset".'
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
    'Export my_dataset:my_table to gcs://my-bucket/my-file as raw CSV.'
  )
  .example(
    'node $0 export my_dataset my_table my-bucket my-file -f JSON --gzip',
    'Export my_dataset:my_table to gcs://my-bucket/my-file as gzipped JSON.'
  )
  .example(
    'node $0 insert my_dataset my_table json_string',
    'Insert the JSON array represented by json_string into my_dataset:my_table.'
  )
  .example(
    'node $0 insert my_dataset my_table json_file',
    'Insert the JSON objects contained in json_file (one per line) into my_dataset:my_table.'
  )
  .example(
    'node $0 copy src_dataset src_table dest_dataset dest_table',
    'Copy src_dataset:src_table to dest_dataset:dest_table.'
  )
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/bigquery/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
