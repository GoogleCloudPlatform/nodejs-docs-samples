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

// [START job_search_list_jobs]

const talent = require('@google-cloud/talent').v4;

/**
 * List Jobs
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenant
 */
function sampleListJobs(projectId, tenantId, filter) {
  const client = new talent.JobServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const filter = 'companyName=projects/my-project/companies/company-id';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const request = {
    parent: formattedParent,
    filter: filter,
  };

  client
    .listJobs(request)
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources) {
        console.log(`Job name: ${resource.name}`);
        console.log(`Job requisition ID: ${resource.requisitionId}`);
        console.log(`Job title: ${resource.title}`);
        console.log(`Job description: ${resource.description}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_list_jobs]
// tslint:disable-next-line:no-any

const argv = require('yargs')
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true,
  })
  .option('tenant_id', {
    default: 'Your Tenant ID (using tenancy is optional)',
    string: true,
  })
  .option('filter', {
    default: 'companyName=projects/my-project/companies/company-id',
    string: true,
  }).argv;

sampleListJobs(argv.project_id, argv.tenant_id, argv.filter);
