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

function createTable (datasetId, tableId, schema, projectId) {
  // [START bigquery_create_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset in which to create the table, e.g. "my_dataset"
  // const datasetId = "my_new_dataset";

  // The ID for the new table, e.g. "my_new_table"
  // const tableId = "my_new_table";

  // The schema of the new table, e.g. "Name:string, Age:integer, Weight:float, IsMagic:boolean"
  // const schema = "Name:string, Age:integer, Weight:float, IsMagic:boolean";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema
  };

  // Create a new table in the dataset
  bigquery
    .dataset(datasetId)
    .createTable(tableId, options)
    .then((results) => {
      const table = results[0];
      console.log(`Table ${table.id} created.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_create_table]
}

function deleteTable (datasetId, tableId, projectId) {
  // [START bigquery_delete_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset of the table to delete, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // The ID of the table to delete, e.g. "my_table"
  // const tableId = "my_table";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Deletes the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .delete()
    .then(() => {
      console.log(`Table ${tableId} deleted.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_delete_table]
}

function listTables (datasetId, projectId) {
  // [START bigquery_list_tables]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset to list tables in, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Lists all tables in the dataset
  bigquery
    .dataset(datasetId)
    .getTables()
    .then((results) => {
      const tables = results[0];
      console.log('Tables:');
      tables.forEach((table) => console.log(table.id));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_list_tables]
}

function browseRows (datasetId, tableId, projectId) {
  // [START bigquery_browse_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset of the table to browse, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // The ID of the table to browse, e.g. "my_table"
  // const tableId = "my_table";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Lists rows in the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .getRows()
    .then((results) => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach((row) => console.log(row));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_browse_table]
}

function copyTable (srcDatasetId, srcTableId, destDatasetId, destTableId, projectId) {
  // [START bigquery_copy_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset of the table to copy, e.g. "my_src_dataset"
  // const srcDatasetId = "my_src_dataset";

  // The ID of the table to copy, e.g. "my_src_table"
  // const srcTableId = "my_src_table";

  // The ID of the destination dataset, e.g. "my_dest_dataset"
  // const destDatasetId = "my_dest_dataset";

  // The ID of the destination table, e.g. "my_dest_table"
  // const destTableId = "my_dest_table";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  let job;

  // Copies the table contents into another table
  bigquery
    .dataset(srcDatasetId)
    .table(srcTableId)
    .copy(bigquery.dataset(destDatasetId).table(destTableId))
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise();
    })
    .then((results) => {
      // Get the job's status
      return job.getMetadata();
    }).then((metadata) => {
      // Check the job's status for errors
      const errors = metadata[0].status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    }).then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_copy_table]
}

function importLocalFile (datasetId, tableId, filename, projectId) {
  // [START bigquery_import_from_file]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The name of the file from which data should be imported, e.g. "/path/to/file.csv"
  // const filename = "/path/to/file.csv";

  // The ID of the dataset of the table into which data should be imported, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // The ID of the table into which data should be imported, e.g. "my_table"
  // const tableId = "my_table";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  let job;

  // Imports data from a local file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .import(filename)
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise();
    })
    .then((results) => {
      // Get the job's status
      return job.getMetadata();
    }).then((metadata) => {
      // Check the job's status for errors
      const errors = metadata[0].status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    }).then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_import_from_file]
}

function importFileFromGCS (datasetId, tableId, bucketName, filename, projectId) {
  // [START bigquery_import_from_gcs]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset of the table into which data should be imported, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // The ID of the table into which data should be imported, e.g. "my_table"
  // const tableId = "my_table";

  // The name of the Google Cloud Storage bucket where the file is located, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file from which data should be imported, e.g. "file.csv"
  // const filename = "file.csv";

  // Instantiates clients
  const bigquery = BigQuery({
    projectId: projectId
  });

  const storage = Storage({
    projectId: projectId
  });

  let job;

  // Imports data from a Google Cloud Storage file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .import(storage.bucket(bucketName).file(filename))
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise();
    })
    .then((results) => {
      // Get the job's status
      return job.getMetadata();
    }).then((metadata) => {
      // Check the job's status for errors
      const errors = metadata[0].status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    }).then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_import_from_gcs]
}

function exportTableToGCS (datasetId, tableId, bucketName, filename, projectId) {
  // [START bigquery_export_gcs]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset of the table into which data should be imported, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // The ID of the table into which data should be imported, e.g. "my_table"
  // const tableId = "my_table";

  // The name of the Google Cloud Storage bucket where the file is located, e.g. "my-bucket"
  // const bucketName = "my-bucket";

  // The name of the file from which data should be imported, e.g. "file.csv"
  // const filename = "file.csv";

  // Instantiates clients
  const bigquery = BigQuery({
    projectId: projectId
  });

  const storage = Storage({
    projectId: projectId
  });

  let job;

  // Exports data from the table into a Google Cloud Storage file
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .export(storage.bucket(bucketName).file(filename))
    .then((results) => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise();
    })
    .then((results) => {
      // Get the job's status
      return job.getMetadata();
    }).then((metadata) => {
      // Check the job's status for errors
      const errors = metadata[0].status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    }).then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_export_gcs]
}

function insertRowsAsStream (datasetId, tableId, rows, projectId) {
  // [START bigquery_insert_stream]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // The ID of the dataset of the table into which data should be inserted, e.g. "my_dataset"
  // const datasetId = "my_dataset";

  // The ID of the table into which data should be inserted, e.g. "my_table"
  // const tableId = "my_table";

  // The rows to insert into the table
  // Customize this object to match your table's schema
  // const rows = [{name: "Tom", age: 30}, {name: "Jane", age: 32}];

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Inserts data into a table
  bigquery
  .dataset(datasetId)
  .table(tableId)
  .insert(rows)
  .then((response) => {
    const insertErrors = response.insertErrors;
    if (insertErrors && insertErrors.length > 0) {
      console.log('start insert errors');
      insertErrors.forEach((err) => console.error(JSON.stringify(err, null, 2)));
      console.log('end insert errors');
    } else {
      console.log('inserted:');
      rows.forEach((row) => console.log(row));
      console.log('end inserted');
    }
  })
  .catch((err) => {
    console.error('Exception:', JSON.stringify(err, null, 2));
  });
  // [END bigquery_insert_stream]
}

const fs = require(`fs`);

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
  .command(`create <datasetId> <tableId> <schema>`, `Creates a new table.`, {}, (opts) => {
    createTable(opts.datasetId, opts.tableId, opts.schema, opts.projectId);
  })
  .command(`list <datasetId>`, `Lists all tables in a dataset.`, {}, (opts) => {
    listTables(opts.datasetId, opts.projectId);
  })
  .command(`delete <datasetId> <tableId>`, `Deletes a table.`, {}, (opts) => {
    deleteTable(opts.datasetId, opts.tableId, opts.projectId);
  })
  .command(`copy <srcDatasetId> <srcTableId> <destDatasetId> <destTableId>`, `Makes a copy of a table.`, {}, (opts) => {
    copyTable(opts.srcDatasetId, opts.srcTableId, opts.destDatasetId, opts.destTableId, opts.projectId);
  })
  .command(`browse <datasetId> <tableId>`, `Lists rows in a table.`, {}, (opts) => {
    browseRows(opts.datasetId, opts.tableId, opts.projectId);
  })
  .command(`import <datasetId> <tableId> <fileName>`, `Imports data from a local file into a table.`, {}, (opts) => {
    importLocalFile(opts.datasetId, opts.tableId, opts.fileName, opts.projectId);
  })
  .command(`import-gcs <datasetId> <tableId> <bucketName> <fileName>`, `Imports data from a Google Cloud Storage file into a table.`, {}, (opts) => {
    importFileFromGCS(opts.datasetId, opts.tableId, opts.bucketName, opts.fileName, opts.projectId);
  })
  .command(`export <datasetId> <tableId> <bucketName> <fileName>`, `Export a table from BigQuery to Google Cloud Storage.`, {}, (opts) => {
    exportTableToGCS(opts.datasetId, opts.tableId, opts.bucketName, opts.fileName, opts.projectId);
  })
  .command(`insert <datasetId> <tableId> <json_or_file>`,
    `Insert a JSON array (as a string or newline-delimited file) into a BigQuery table.`, {},
    (opts) => {
      let content;
      try {
        content = fs.readFileSync(opts.json_or_file);
      } catch (err) {
        content = opts.json_or_file;
      }

      let rows = null;
      try {
        rows = JSON.parse(content);
      } catch (err) {}

      if (!Array.isArray(rows)) {
        throw new Error(`"json_or_file" (or the file it points to) is not a valid JSON array.`);
      }

      insertRowsAsStream(opts.datasetId, opts.tableId, rows, opts.projectId || process.env.GCLOUD_PROJECT);
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
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
