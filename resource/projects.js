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
var Resource = require('@google-cloud/resource');

// Instantiate a resource client
var resource = Resource();
// [END setup]

// [START list_projects]
/**
 * List all projects the authenticated user has access to.
 *
 * @param {function} callback The callback function.
 */
function listProjects (callback) {
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/resource/latest/resource
  resource.getProjects(function (err, projects) {
    if (err) {
      return callback(err);
    }

    console.log('Found %d project(s)!', projects.length);
    return callback(null, projects);
  });
}
// [END list_projects]
// [END all]

// The command-line program
var cli = require('yargs');
var makeHandler = require('../utils').makeHandler;

var program = module.exports = {
  listProjects: listProjects,
  main: function (args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command('list', 'List all projects the authenticated user has access to.', {}, function () {
    program.listProjects(makeHandler(true, 'id'));
  })
  .example('node $0 list', 'List projects.')
  .wrap(80)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/resource-manager/docs/');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
