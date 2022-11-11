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

// [START job_search_list_companies]

const talent = require('@google-cloud/talent').v4;

/**
 * List Companies
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenant
 */
function sampleListCompanies(projectId, tenantId) {
  const client = new talent.CompanyServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  const formattedParent = client.tenantPath(projectId, tenantId);

  client
    .listCompanies({parent: formattedParent})
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources) {
        console.log(`Company Name: ${resource.name}`);
        console.log(`Display Name: ${resource.displayName}`);
        console.log(`External ID: ${resource.externalId}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_list_companies]
// tslint:disable-next-line:no-any

const argv = require('yargs')
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true,
  })
  .option('tenant_id', {
    default: 'Your Tenant ID (using tenancy is optional)',
    string: true,
  }).argv;

sampleListCompanies(argv.project_id, argv.tenant_id);
