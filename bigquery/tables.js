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

const BigQuery = require('@google-cloud/bigquery');
const Storage = require('@google-cloud/storage');

// [START bigquery_create_table]
function createTable (datasetId, tableId, schema, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);

  // Specify a schema, e.g. "Name:string, Age:integer, Weight:float, IsMagic:boolean"
  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema
  };

  // Create a new table in the dataset
  return dataset.createTable(tableId, options)
    .then((results) => {
      const table = results[0];
      console.log(`Table ${table.id} created.`);
      return table;
    });
}
// [END bigquery_create_table]

// [START bigquery_delete_table]
function deleteTable (datasetId, tableId, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);
  // References an existing table, e.g. "my_table"
  const table = dataset.table(tableId);

  // Deletes the table
  return table.delete()
    .then(() => {
      console.log(`Table ${table.id} deleted.`);
    });
}
// [END bigquery_delete_table]

// [START bigquery_list_tables]
function listTables (datasetId, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);

  // Lists all tables in the dataset
  return dataset.getTables()
    .then((results) => {
      const tables = results[0];
      console.log('Tables:');
      tables.forEach((table) => console.log(table.id));
      return tables;
    });
}
// [END bigquery_list_tables]

// [START bigquery_browse_table]
function browseRows (datasetId, tableId, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);
  // References an existing table, e.g. "my_table"
  const table = dataset.table(tableId);

  // Lists rows in the table
  return table.getRows()
    .then((results) => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach((row) => console.log(row));
      return rows;
    });
}
// [END bigquery_browse_table]

// [START bigquery_copy_table]
function copyTable (srcDatasetId, srcTableId, destDatasetId, destTableId, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References the source dataset, e.g. "my_dataset"
  const srcDataset = bigquery.dataset(srcDatasetId);
  // References the source table, e.g. "my_table"
  const srcTable = srcDataset.table(srcTableId);
  // References the destination dataset, e.g. "my_other_dataset"
  const destDataset = bigquery.dataset(destDatasetId);
  // References the destination table, e.g. "my_other_table"
  const destTable = destDataset.table(destTableId);

  let job;

  // Copies the table contents into another table
  return srcTable.copy(destTable)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then((results) => {
      console.log(`Job ${job.id} completed.`);
      return results;
    });
}
// [END bigquery_copy_table]

// [START bigquery_import_from_file]
function importLocalFile (datasetId, tableId, fileName, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);
  // References an existing dataset, e.g. "my_dataset"
  const table = dataset.table(tableId);

  let job;

  // Imports data from a local file into the table
  return table.import(fileName)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then((results) => {
      console.log(`Job ${job.id} completed.`);
      return results;
    });
}
// [END bigquery_import_from_file]

// [START bigquery_import_from_gcs]
function importFileFromGCS (datasetId, tableId, bucketName, fileName, projectId) {
  // Instantiates clients
  const bigquery = BigQuery({
    projectId: projectId
  });
  const storage = Storage({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);
  // References an existing dataset, e.g. "my_dataset"
  const table = dataset.table(tableId);
  // References an existing bucket, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  let job;

  // Imports data from a GCS file into a table
  return table.import(file)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then((results) => {
      console.log(`Job ${job.id} completed.`);
      return results;
    });
}
// [END bigquery_import_from_gcs]

// [START bigquery_export_gcs]
function exportTableToGCS (datasetId, tableId, bucketName, fileName, projectId) {
  // Instantiates clients
  const bigquery = BigQuery({
    projectId: projectId
  });
  const storage = Storage({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);
  // References an existing dataset, e.g. "my_dataset"
  const table = dataset.table(tableId);
  // References an existing bucket, e.g. "my-bucket"
  const bucket = storage.bucket(bucketName);
  // References an existing file, e.g. "file.txt"
  const file = bucket.file(fileName);

  let job;

  // Exports data in a table into a Google Cloud Storage file
  return table.export(file)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then((results) => {
      console.log(`Job ${job.id} completed.`);
      return results;
    });
}
// [END bigquery_export_gcs]

// [START bigquery_insert_stream]
function insertRowsAsStream (datasetId, tableId, rows, projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);
  // References an existing dataset, e.g. "my_dataset"
  const table = dataset.table(tableId);

  // Inserts data into a table
  return table.insert(rows)
    .then((insertErrors) => {
      console.log('Inserted:');
      rows.forEach((row) => console.log(row));
      return insertErrors;
    });
}
// [END bigquery_insert_stream]

// The command-line program
const cli = require(`yargs`);
const fs = require(`fs`);

const program = module.exports = {
  createTable: createTable,
  listTables: listTables,
  browseRows: browseRows,
  deleteTable: deleteTable,
  importLocalFile: importLocalFile,
  importFileFromGCS: importFileFromGCS,
  exportTableToGCS: exportTableToGCS,
  insertRowsAsStream: insertRowsAsStream,
  copyTable: copyTable,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`create <datasetId> <tableId> <schema> [projectId]`, `Creates a new table.`, {}, (opts) => {
    program.createTable(opts.datasetId, opts.tableId, opts.schema, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`list <datasetId> [projectId]`, `Lists all tables in a dataset.`, {}, (opts) => {
    program.listTables(opts.datasetId, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`delete <datasetId> <tableId> [projectId]`, `Deletes a table.`, {}, (opts) => {
    program.deleteTable(opts.datasetId, opts.tableId, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`copy <srcDatasetId> <srcTableId> <destDatasetId> <destTableId> [projectId]`, `Makes a copy of a table.`, {}, (opts) => {
    program.copyTable(opts.srcDatasetId, opts.srcTableId, opts.destDatasetId, opts.destTableId, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`browse <datasetId> <tableId> [projectId]`, `Lists rows in a table.`, {}, (opts) => {
    program.browseRows(opts.datasetId, opts.tableId, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`import <datasetId> <tableId> <fileName> [projectId]`, `Imports data from a local file into a table.`, {}, (opts) => {
    program.importLocalFile(opts.datasetId, opts.tableId, opts.fileName, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`import-gcs <datasetId> <tableId> <bucketName> <fileName> [projectId]`, `Imports data from a Google Cloud Storage file into a table.`, {}, (opts) => {
    program.importFileFromGCS(opts.datasetId, opts.tableId, opts.bucketName, opts.fileName, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`export <datasetId> <tableId> <bucketName> <fileName> [projectId]`, `Export a table from BigQuery to Google Cloud Storage.`, {}, (opts) => {
    program.exportTableToGCS(opts.datasetId, opts.tableId, opts.bucketName, opts.fileName, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`insert <datasetId> <tableId> <json_or_file> [projectId]`,
    `Insert a JSON array (as a string or newline-delimited file) into a BigQuery table.`, {},
    (opts) => {
      var content;
      try {
        content = fs.readFileSync(opts.json_or_file);
      } catch (err) {
        content = opts.json_or_file;
      }

      var rows = null;
      try {
        rows = JSON.parse(content);
      } catch (err) {}

      if (!Array.isArray(rows)) {
        throw new Error(`"json_or_file" (or the file it points to) is not a valid JSON array.`);
      }

      program.insertRowsAsStream(opts.datasetId, opts.tableId, rows, opts.projectId || process.env.GCLOUD_PROJECT);
    }
  )
  .example(
    `node $0 create my_dataset my_table "Name:string, Age:integer, Weight:float, IsMagic:boolean"`,
    `Creates a new table named "my_table" in "my_dataset".`
  )
  .example(
    `node $0 list my_dataset`,
    `Lists tables in "my_dataset".`
  )
  .example(
    `node $0 browse my_dataset my_table`,
    `Displays rows from "my_table" in "my_dataset".`
  )
  .example(
    `node $0 delete my_dataset my_table`,
    `Deletes "my_table" from "my_dataset".`
  )
  .example(
    `node $0 import my_dataset my_table ./data.csv`,
    `Imports a local file into a table.`
  )
  .example(
    `node $0 import-gcs my_dataset my_table my-bucket data.csv`,
    `Imports a GCS file into a table.`
  )
  .example(
    `node $0 export my_dataset my_table my-bucket my-file`,
    `Exports my_dataset:my_table to gcs://my-bucket/my-file as raw CSV.`
  )
  .example(
    `node $0 export my_dataset my_table my-bucket my-file -f JSON --gzip`,
    `Exports my_dataset:my_table to gcs://my-bucket/my-file as gzipped JSON.`
  )
  .example(
    `node $0 insert my_dataset my_table json_string`,
    `Inserts the JSON array represented by json_string into my_dataset:my_table.`
  )
  .example(
    `node $0 insert my_dataset my_table json_file`,
    `Inserts the JSON objects contained in json_file (one per line) into my_dataset:my_table.`
  )
  .example(
    `node $0 copy src_dataset src_table dest_dataset dest_table`,
    `Copies src_dataset:src_table to dest_dataset:dest_table.`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
