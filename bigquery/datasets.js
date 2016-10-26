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

// [START bigquery_create_dataset]
function createDataset (datasetId) {
  // Instantiates a client
  const bigquery = BigQuery();

  // Creates a new dataset, e.g. "my_new_dataset"
  return bigquery.createDataset(datasetId)
    .then((results) => {
      const dataset = results[0];
      console.log(`Dataset ${dataset.id} created.`);
      return dataset;
    });
}
// [END bigquery_create_dataset]

// [START bigquery_delete_dataset]
function deleteDataset (datasetId) {
  // Instantiates a client
  const bigquery = BigQuery();

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);

  // Deletes the dataset
  return dataset.delete()
    .then(() => {
      console.log(`Dataset ${dataset.id} deleted.`);
    });
}
// [END bigquery_delete_dataset]

// [START bigquery_list_datasets]
function listDatasets (projectId) {
  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Lists all datasets in the specified project
  return bigquery.getDatasets()
    .then((results) => {
      const datasets = results[0];
      console.log('Datasets:');
      datasets.forEach((dataset) => console.log(dataset.id));
      return datasets;
    });
}
// [END bigquery_list_datasets]

// [START bigquery_get_dataset_size]
function getDatasetSize (datasetId, projectId) {
  // Instantiate a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // References an existing dataset, e.g. "my_dataset"
  const dataset = bigquery.dataset(datasetId);

  // Lists all tables in the dataset
  return dataset.getTables()
    .then((results) => results[0])
    // Retrieve the metadata for each table
    .then((tables) => Promise.all(tables.map((table) => table.get())))
    .then((results) => results.map((result) => result[0]))
    // Select the size of each table
    .then((tables) => tables.map((table) => (parseInt(table.metadata.numBytes, 10) / 1000) / 1000))
    // Sum up the sizes
    .then((sizes) => sizes.reduce((cur, prev) => cur + prev, 0))
    // Print and return the size
    .then((sum) => {
      console.log(`Size of ${dataset.id}: ${sum} MB`);
      return sum;
    });
}
// [END bigquery_get_dataset_size]

// The command-line program
const cli = require(`yargs`);

const program = module.exports = {
  createDataset: createDataset,
  deleteDataset: deleteDataset,
  listDatasets: listDatasets,
  getDatasetSize: getDatasetSize,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`create <datasetId>`, `Creates a new dataset.`, {}, (opts) => {
    program.createDataset(opts.datasetId);
  })
  .command(`delete <datasetId>`, `Deletes a dataset.`, {}, (opts) => {
    program.deleteDataset(opts.datasetId);
  })
  .command(`list [projectId]`, `Lists all datasets in the specified project or the current project.`, {}, (opts) => {
    program.listDatasets(opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .command(`size <datasetId> [projectId]`, `Calculates the size of a dataset.`, {}, (opts) => {
    program.getDatasetSize(opts.datasetId, opts.projectId || process.env.GCLOUD_PROJECT);
  })
  .example(`node $0 create my_dataset`, `Creates a new dataset named "my_dataset".`)
  .example(`node $0 delete my_dataset`, `Deletes a dataset named "my_dataset".`)
  .example(`node $0 list`, `Lists all datasets in the current project.`)
  .example(`node $0 list bigquery-public-data`, `Lists all datasets in the "bigquery-public-data" project.`)
  .example(`node $0 size my_dataset`, `Calculates the size of "my_dataset" in the current project.`)
  .example(`node $0 size hacker_news bigquery-public-data`, `Calculates the size of "bigquery-public-data:hacker_news".`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
