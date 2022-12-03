// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START job_search_list_tenants]

const talent = require('@google-cloud/talent').v4;

/** List Tenants */
function sampleListTenants(projectId) {
  const client = new talent.TenantServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  const formattedParent = client.projectPath(projectId);

  client
    .listTenants({parent: formattedParent})
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources) {
        console.log(`Tenant Name: ${resource.name}`);
        console.log(`External ID: ${resource.externalId}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_list_tenants]
// tslint:disable-next-line:no-any

const argv = require('yargs').option('project_id', {
  default: 'Your Google Cloud Project ID',
  string: true,
}).argv;

sampleListTenants(argv.project_id);
