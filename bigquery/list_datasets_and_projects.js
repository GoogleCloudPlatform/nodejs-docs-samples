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

/*
Command-line application to list all projects and datasets in BigQuery.

This sample is used on this page:

    https://cloud.google.com/bigquery/docs/managing_jobs_datasets_projects
*/

'use strict';

var async = require('async');

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
  var bigquery = gcloud.bigquery({
    projectId: projectId
  });

  // Grab paginated tables
  bigquery.getDatasets(function (err, datasets, nextQuery, apiResponse) {

    // Quit on error
    if (err) {
      return callback(err);
    }

    // Pagination
    if (nextQuery) {
      return bigquery.getDatasets(nextQuery, callback)
    }

    // Last page of datasets
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

  resource.getProjects({}, function(err, projects, nextQuery, apiResponse) {

    // Quit on error
    if (err) {
      return callback(err);
    }

    // Pagination
    if (nextQuery) {
      return resource.getProjects(nextQuery, callback)
    }

    // Last page of projects
    return callback(null, projects);

  });
}
// [END list_projects]

// Run the examples
exports.main = function (projectId, callback) {
  var cbFunc =
    function (err, response) {
      if (err) {
        return callback(err);
      }
      callback(null, response);
    };


  if (projectId != null) {
    listDatasets(projectId, cbFunc);
  } else {
    listProjects(cbFunc);
  }

};

if (module === require.main) {
  var args = process.argv.slice(1);
  if (args.length > 2) {
    throw new Error('Usage: node list_datasets_and_projects.js [<projectId>]');
  }
  exports.main(args[1], console.log);
}