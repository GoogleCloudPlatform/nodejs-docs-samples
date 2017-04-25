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

function createDataset (datasetId, projectId) {
  // [START bigquery_create_dataset]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // The ID for the new dataset, e.g. "my_new_dataset"
  // const datasetId = "my_new_dataset";

  // Creates a new dataset
  bigquery.createDataset(datasetId)
    .then((results) => {
      const dataset = results[0];
      console.log(`Dataset ${dataset.id} created.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_create_dataset]
}

function deleteDataset (datasetId, projectId) {
  // [START bigquery_delete_dataset]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // The ID of the dataset to delete, e.g. "my_new_dataset"
  // const datasetId = "my_new_dataset";

  // Creates a reference to the existing dataset
  const dataset = bigquery.dataset(datasetId);

  // Deletes the dataset
  dataset.delete()
    .then(() => {
      console.log(`Dataset ${dataset.id} deleted.`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_delete_dataset]
}

function listDatasets (projectId) {
  // [START bigquery_list_datasets]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // The project ID to use, e.g. "your-project-id"
  // const projectId = "your-project-id";

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Lists all datasets in the specified project
  bigquery.getDatasets()
    .then((results) => {
      const datasets = results[0];
      console.log('Datasets:');
      datasets.forEach((dataset) => console.log(dataset.id));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_list_datasets]
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
    `create <datasetId>`,
    `Creates a new dataset.`,
    {},
    (opts) => createDataset(opts.datasetId, opts.projectId)
  )
  .command(
    `delete <datasetId>`,
    `Deletes a dataset.`,
    {},
    (opts) => deleteDataset(opts.datasetId, opts.projectId)
  )
  .command(
    `list`,
    `Lists datasets.`,
    {},
    (opts) => listDatasets(opts.projectId)
  )
  .example(`node $0 create my_dataset`, `Creates a new dataset named "my_dataset".`)
  .example(`node $0 delete my_dataset`, `Deletes a dataset named "my_dataset".`)
  .example(`node $0 list`, `Lists all datasets in the project specified by the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environments variables.`)
  .example(`node $0 list --projectId=bigquery-public-data`, `Lists all datasets in the "bigquery-public-data" project.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
