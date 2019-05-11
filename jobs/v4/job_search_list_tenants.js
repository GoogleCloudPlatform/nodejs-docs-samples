// DO NOT EDIT! This is a generated sample ("RequestAsyncPagedAll",  "job_search_list_tenants")
'use strict';

// [START job_search_list_tenants]
// [START job_search_list_tenants_core]

const talent = require('@google-cloud/talent').v4beta1;

/** List Tenants */
function sampleListTenants(projectId) {
  const client = new talent.TenantServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  const formattedParent = client.projectPath(projectId);

  client.listTenants({parent: formattedParent})
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


// [END job_search_list_tenants_core]
// [END job_search_list_tenants]
// tslint:disable-next-line:no-any

const argv = require(`yargs`)
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true
  })
  .argv;

sampleListTenants(argv.project_id);