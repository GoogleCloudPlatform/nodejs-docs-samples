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
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/latest/guides/authentication
var BigQuery = require('@google-cloud/bigquery');
// [END setup]

function createDataset (datasetId, callback) {
  var bigquery = BigQuery();
  var dataset = bigquery.dataset(datasetId);

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/dataset?method=create
  dataset.create(function (err, dataset, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Created dataset: %s', datasetId);
    return callback(null, dataset, apiResponse);
  });
}

function deleteDataset (datasetId, callback) {
  var bigquery = BigQuery();
  var dataset = bigquery.dataset(datasetId);

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/dataset?method=delete
  dataset.delete(function (err) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted dataset: %s', datasetId);
    return callback(null);
  });
}

function listDatasets (projectId, callback) {
  var bigquery = BigQuery({
    projectId: projectId
  });

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery?method=getDatasets
  bigquery.getDatasets(function (err, datasets) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d dataset(s)!', datasets.length);
    return callback(null, datasets);
  });
}

// [START get_dataset_size]
// Control-flow helper library
var async = require('async');

function getDatasetSize (datasetId, projectId, callback) {
  // Instantiate a bigquery client
  var bigquery = BigQuery({
    projectId: projectId
  });
  var dataset = bigquery.dataset(datasetId);

  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/dataset?method=getTables
  dataset.getTables(function (err, tables) {
    if (err) {
      return callback(err);
    }

    return async.map(tables, function (table, cb) {
      // Fetch more detailed info for each table
      // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/table?method=get
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
  .command('create <datasetId>', 'Create a new dataset with the specified ID.', {}, function (options) {
    program.createDataset(options.datasetId, makeHandler());
  })
  .command('delete <datasetId>', 'Delete the dataset with the specified ID.', {}, function (options) {
    program.deleteDataset(options.datasetId, makeHandler());
  })
  .command('list', 'List datasets in the specified project.', {}, function (options) {
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
  .example('node $0 create my_dataset', 'Create a new dataset with the ID "my_dataset".')
  .example('node $0 delete my_dataset', 'Delete a dataset identified as "my_dataset".')
  .example('node $0 list', 'List datasets.')
  .example('node $0 list -p bigquery-public-data', 'List datasets in the "bigquery-public-data" project.')
  .example('node $0 size my_dataset', 'Calculate the size of "my_dataset".')
  .example('node $0 size hacker_news -p bigquery-public-data', 'Calculate the size of "bigquery-public-data:hacker_news".')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/bigquery/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
