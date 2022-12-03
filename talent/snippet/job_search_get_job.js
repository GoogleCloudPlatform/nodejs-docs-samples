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

// [START job_search_get_job]

const talent = require('@google-cloud/talent').v4;

/** Get Job */
function sampleGetJob(projectId, tenantId, jobId) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const jobId = 'Job ID';
  const formattedName = client.jobPath(projectId, tenantId, jobId);
  client
    .getJob({name: formattedName})
    .then(responses => {
      const response = responses[0];
      console.log(`Job name: ${response.name}`);
      console.log(`Requisition ID: ${response.requisitionId}`);
      console.log(`Title: ${response.title}`);
      console.log(`Description: ${response.description}`);
      console.log(`Posting language: ${response.languageCode}`);
      for (const address of response.addresses) {
        console.log(`Address: ${address}`);
      }
      for (const email of response.applicationInfo.emails) {
        console.log(`Email: ${email}`);
      }
      for (const websiteUri of response.applicationInfo.uris) {
        console.log(`Website: ${websiteUri}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// [END job_search_get_job]
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
  .option('job_id', {
    default: 'Job ID',
    string: true,
  }).argv;

sampleGetJob(argv.project_id, argv.tenant_id, argv.job_id);
