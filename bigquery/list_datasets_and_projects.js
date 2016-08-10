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

/**
 * Command-line application to list all projects and datasets in BigQuery.
 *
 * This sample is used on this page:
 *
 *   https://cloud.google.com/bigquery/docs/managing_jobs_datasets_projects
 */

'use strict';

// [START all]
// [START auth]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var gcloud = require('gcloud');
// [END auth]

// [START list_tables]
/**
 * Retrieve all datasets for the specified project.
 *
 * @param {string} projectId The project to get datasets from.
 * @param {Function} callback Callback function.
 */
function listDatasets (projectId, callback) {
  if (!projectId) {
    return callback(new Error('projectId is required!'));
  }
  var bigquery = gcloud.bigquery({
    projectId: projectId
  });

  bigquery.getDatasets(function (err, datasets) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d datasets!', datasets.length);
    return callback(null, datasets);
  });
}
// [END list_tables]

// [START list_projects]
/**
 * Retrieve all projects a user has access to.
 *
 * @param {Function} callback Callback function.
 */
function listProjects (callback) {
  var resource = gcloud.resource();

  resource.getProjects(function (err, projects) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d projects!', projects.length);
    return callback(null, projects);
  });
}
// [END list_projects]

// [START usage]
function printUsage () {
  console.log('Usage: node list_datasets_and_projects [COMMAND] [ARGS...]');
  console.log('\nCommands:\n');
  console.log('\tlist-datasets PROJECT_ID');
  console.log('\tlist-projects');
}
// [END usage]

// The command-line program
var program = {
  // Print usage instructions
  printUsage: printUsage,

  // Exports
  listDatasets: listDatasets,
  listProjects: listProjects,

  // Run the examples
  main: function (args, cb) {
    var command = args.shift();
    if (command === 'list-datasets') {
      this.listDatasets(args[0], cb);
    } else if (command === 'list-projects') {
      this.listProjects(cb);
    } else {
      this.printUsage();
    }
  }
};

if (module === require.main) {
  program.main(process.argv.slice(2), console.log);
}
// [END all]

module.exports = program;
