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

// [START job_search_get_company]

const talent = require('@google-cloud/talent').v4;

/** Get Company */
function sampleGetCompany(projectId, tenantId, companyId) {
  const client = new talent.CompanyServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const companyId = 'Company ID';
  const formattedName = client.companyPath(projectId, tenantId, companyId);
  client
    .getCompany({name: formattedName})
    .then(responses => {
      const response = responses[0];
      console.log(`Company name: ${response.name}`);
      console.log(`Display name: ${response.displayName}`);
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_get_company]
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
  .option('company_id', {
    default: 'Company ID',
    string: true,
  }).argv;

sampleGetCompany(argv.project_id, argv.tenant_id, argv.company_id);
