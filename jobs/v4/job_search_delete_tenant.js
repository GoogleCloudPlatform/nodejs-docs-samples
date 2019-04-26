// DO NOT EDIT! This is a generated sample ("Request",  "job_search_delete_tenant")
'use strict';

// [START job_search_delete_tenant]
// [START job_search_delete_tenant_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Delete Tenant */
function sampleDeleteTenant(projectId, tenantId) {
  const client = new talent.TenantServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID)';
  const formattedName = client.tenantPath(projectId, tenantId);
  client.deleteTenant({name: formattedName}).catch(err => {
    console.error(err);
  });
  console.log(`Deleted Tenant.`);
}


// [END job_search_delete_tenant_core]
// [END job_search_delete_tenant]
// tslint:disable-next-line:no-any

const argv = require(`yargs`)
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true
  })
  .option('tenant_id', {
    default: 'Your Tenant ID)',
    string: true
  })
  .argv;

sampleDeleteTenant(argv.project_id, argv.tenant_id);