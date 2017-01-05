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

const Resource = require('@google-cloud/resource');

// [START resource_list_projects]
function listProjects () {
  // Instantiates a client
  const resource = Resource();

  // Lists all current projects
  return resource.getProjects()
    .then((results) => {
      const projects = results[0];
      console.log('Projects:');
      projects.forEach((project) => console.log(project.id));
      return projects;
    });
}
// [END resource_list_projects]

// The command-line program
const cli = require(`yargs`);

const program = module.exports = {
  listProjects: listProjects,
  main: (args) => {
    // Run the command-line program
    cli.help().strict().parse(args).argv;
  }
};

cli
  .demand(1)
  .command(`list`, `List all current projects.`, {}, program.listProjects)
  .example(`node $0 list`, `Lists all current projects.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/resource-manager/docs`);

if (module === require.main) {
  program.main(process.argv.slice(2));
}
