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
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var BigQuery = require('@google-cloud/bigquery');

// Instantiate the bigquery client
var bigquery = BigQuery();
// [END setup]

// Control-flow helper library
var async = require('async');

// [START create_dataset]
/**
 * List datasets in the authenticated project.
 *
 * @param {string} name The name for the new dataset.
 * @param {function} callback The callback function.
 */
function createDataset (name, callback) {
  var dataset = bigquery.dataset(name);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery
  dataset.create(function (err, dataset) {
    if (err) {
      return callback(err);
    }

    console.log('Created dataset: %s', name);
    return callback(null, dataset);
  });
}
// [END create_dataset]

// [START delete_dataset]
/**
 * List datasets in the authenticated project.
 *
 * @param {string} name The name for the new dataset.
 * @param {function} callback The callback function.
 */
function deleteDataset (name, callback) {
  var dataset = bigquery.dataset(name);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery
  dataset.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted dataset: %s', name);
    return callback(null);
  });
}
// [END delete_dataset]

// [START list_datasets]
/**
 * List datasets in the authenticated project.
 *
 * @param {string} projectId The project ID to use.
 * @param {function} callback The callback function.
 */
function listDatasets (projectId, callback) {
  // Instantiate a bigquery client
  var bigquery = BigQuery({
    projectId: projectId
  });

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery
  bigquery.getDatasets(function (err, datasets) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d dataset(s)!', datasets.length);
    return callback(null, datasets);
  });
}
// [END list_datasets]

// [START get_dataset_size]
/**
 * Calculate the size of the specified dataset.
 *
 * @param {string} datasetId The ID of the dataset.
 * @param {string} projectId The project ID.
 * @param {function} callback The callback function.
 */
function getDatasetSize (datasetId, projectId, callback) {
  // Instantiate a bigquery client
  var bigquery = BigQuery({
    projectId: projectId
  });
  var dataset = bigquery.dataset(datasetId);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/bigquery/latest/bigquery/dataset
  dataset.getTables(function (err, tables) {
    if (err) {
      return callback(err);
    }

    return async.map(tables, function (table, cb) {
      // Fetch more detailed info for each table
      table.get(function (err, tableInfo) {
        if (err) {
          return cb(err);
        }
        // Return numBytes converted to Megabytes
        var numBytes = tableInfo.metadata.numBytes;
        return cb(null, (parseInt(numBytes, 10) / 1000) / 1000);
      });
    }, function (err, sizes) {
      if (err) {
        return callback(err);
      }
      var sum = sizes.reduce(function (cur, prev) {
        return cur + prev;
      }, 0);

      console.log('Size of %s: %d MB', datasetId, sum);
      return callback(null, sum);
    });
  });
}
// [END get_dataset_size]
// [END all]

// The command-line program
var cli = require('yargs');
var makeHandler = require('../utils').makeHandler;

var program = module.exports = {
  createDataset: createDataset,
  deleteDataset: deleteDataset,
  listDatasets: listDatasets,
  getDatasetSize: getDatasetSize,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('create <name>', 'Create a new dataset.', {}, function (options) {
    program.createDataset(options.name, makeHandler());
  })
  .command('delete <datasetId>', 'Delete the specified dataset.', {}, function (options) {
    program.deleteDataset(options.datasetId, makeHandler());
  })
  .command('list', 'List datasets in the authenticated project.', {}, function (options) {
    program.listDatasets(options.projectId, makeHandler(true, 'id'));
  })
  .command('size <datasetId>', 'Calculate the size of the specified dataset.', {}, function (options) {
    program.getDatasetSize(options.datasetId, options.projectId, makeHandler());
  })
  .option('projectId', {
    alias: 'p',
    requiresArg: true,
    type: 'string',
    default: process.env.GCLOUD_PROJECT,
    description: 'Optionally specify the project ID to use.',
    global: true
  })
  .example('node $0 create my_dataset', 'Create a new dataset named "my_dataset".')
  .example('node $0 delete my_dataset', 'Delete "my_dataset".')
  .example('node $0 list', 'List datasets.')
  .example('node $0 list -p bigquery-public-data', 'List datasets in a project other than the authenticated project.')
  .example('node $0 size my_dataset', 'Calculate the size of "my_dataset".')
  .example('node $0 size hacker_news -p bigquery-public-data', 'Calculate the size of "bigquery-public-data:hacker_news".')
  .wrap(100)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/bigquery/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
