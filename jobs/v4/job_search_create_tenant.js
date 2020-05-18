// DO NOT EDIT! This is a generated sample ("Request",  "job_search_create_tenant")
'use strict';

// [START job_search_create_tenant]
// [START job_search_create_tenant_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Create Tenant for scoping resources, e.g. companies and jobs */
function sampleCreateTenant(projectId, externalId) {
  const client = new talent.TenantServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const externalId = 'Your Unique Identifier for Tenant';
  const formattedParent = client.projectPath(projectId);
  const tenant = {
    externalId: externalId,
  };
  const request = {
    parent: formattedParent,
    tenant: tenant,
  };
  client.createTenant(request)
    .then(responses => {
      const response = responses[0];
      console.log(`Created Tenant`);
      console.log(`Name: ${response.name}`);
      console.log(`External ID: ${response.externalId}`);
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_create_tenant_core]
// [END job_search_create_tenant]
// tslint:disable-next-line:no-any

const argv = require(`yargs`)
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true
  })
  .option('external_id', {
    default: 'Your Unique Identifier for Tenant',
    string: true
  })
  .argv;

sampleCreateTenant(argv.project_id, argv.external_id);