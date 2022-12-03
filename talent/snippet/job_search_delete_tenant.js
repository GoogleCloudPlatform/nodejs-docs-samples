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

// [START job_search_delete_tenant]

const talent = require('@google-cloud/talent').v4;

/** Delete Tenant */
function sampleDeleteTenant(projectId, tenantId) {
  const client = new talent.TenantServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID)';
  const formattedName = client.tenantPath(projectId, tenantId);
  client.deleteTenant({name: formattedName}).catch(err => {
    console.error(err);
  });
  console.log('Deleted Tenant.');
}

// [END job_search_delete_tenant]
// tslint:disable-next-line:no-any

const argv = require('yargs')
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true,
  })
  .option('tenant_id', {
    default: 'Your Tenant ID)',
    string: true,
  }).argv;

sampleDeleteTenant(argv.project_id, argv.tenant_id);
