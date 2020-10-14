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

// [START job_search_create_company]

const talent = require('@google-cloud/talent').v4;

/**
 * Create Company
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenant
 */
function sampleCreateCompany(projectId, tenantId, displayName, externalId) {
  const client = new talent.CompanyServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const displayName = 'My Company Name';
  // const externalId = 'Identifier of this company in my system';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const company = {
    displayName: displayName,
    externalId: externalId,
  };
  const request = {
    parent: formattedParent,
    company: company,
  };
  client
    .createCompany(request)
    .then(responses => {
      const response = responses[0];
      console.log('Created Company');
      console.log(`Name: ${response.name}`);
      console.log(`Display Name: ${response.displayName}`);
      console.log(`External ID: ${response.externalId}`);
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_create_company]
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
  .option('display_name', {
    default: 'My Company Name',
    string: true,
  })
  .option('external_id', {
    default: 'Identifier of this company in my system',
    string: true,
  }).argv;

sampleCreateCompany(
  argv.project_id,
  argv.tenant_id,
  argv.display_name,
  argv.external_id
);
