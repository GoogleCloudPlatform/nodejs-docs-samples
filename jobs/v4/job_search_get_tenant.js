// DO NOT EDIT! This is a generated sample ("Request",  "job_search_get_tenant")
'use strict';

// [START job_search_get_tenant]
// [START job_search_get_tenant_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Get Tenant by name */
function sampleGetTenant(projectId, tenantId) {
  const client = new talent.TenantServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID';
  const formattedName = client.tenantPath(projectId, tenantId);
  client.getTenant({name: formattedName})
    .then(responses => {
      const response = responses[0];
      console.log(`Name: ${response.name}`);
      console.log(`External ID: ${response.externalId}`);
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_get_tenant_core]
// [END job_search_get_tenant]
// tslint:disable-next-line:no-any

const argv = require(`yargs`)
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true
  })
  .option('tenant_id', {
    default: 'Your Tenant ID',
    string: true
  })
  .argv;

sampleGetTenant(argv.project_id, argv.tenant_id);