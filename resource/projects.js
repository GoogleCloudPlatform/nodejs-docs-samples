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

function listProjects () {
  // [START resource_list_projects]
  // Imports the Google Cloud client library
  const Resource = require('@google-cloud/resource');

  // Instantiates a client
  const resource = Resource();

  // Lists all current projects
  resource.getProjects()
    .then((results) => {
      const projects = results[0];
      console.log('Projects:');
      projects.forEach((project) => console.log(project.id));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END resource_list_projects]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(`list`, `List all current projects.`, {}, listProjects)
  .example(`node $0 list`, `Lists all current projects.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/resource-manager/docs`)
  .help()
  .strict()
  .argv;
