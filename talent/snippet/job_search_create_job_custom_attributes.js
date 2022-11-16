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

// [START job_search_create_job_custom_attributes]

const talent = require('@google-cloud/talent').v4;

/**
 * Create Job with Custom Attributes
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenantd
 */
function sampleCreateJob(
  projectId,
  tenantId,
  companyName,
  requisitionId,
  languageCode
) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const companyName = 'Company name, e.g. projects/your-project/companies/company-id';
  // const requisitionId = 'Job requisition ID, aka Posting ID. Unique per job.';
  // const languageCode = 'en-US';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const job = {
    company: companyName,
    requisitionId: requisitionId,
    languageCode: languageCode,
  };
  const request = {
    parent: formattedParent,
    job: job,
  };
  client
    .createJob(request)
    .then(responses => {
      const response = responses[0];
      console.log(`Created job: ${response.name}`);
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_create_job_custom_attributes]
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
  .option('company_name', {
    default: 'Company name, e.g. projects/your-project/companies/company-id',
    string: true,
  })
  .option('requisition_id', {
    default: 'Job requisition ID, aka Posting ID. Unique per job.',
    string: true,
  })
  .option('language_code', {
    default: 'en-US',
    string: true,
  }).argv;

sampleCreateJob(
  argv.project_id,
  argv.tenant_id,
  argv.company_name,
  argv.requisition_id,
  argv.language_code
);
