// DO NOT EDIT! This is a generated sample ("RequestAsyncPagedAll",  "job_search_list_companies")
'use strict';

// [START job_search_list_companies]
// [START job_search_list_companies_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * List Companies
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenant
 */
function sampleListCompanies(projectId, tenantId) {
  const client = new talent.CompanyServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  const formattedParent = client.tenantPath(projectId, tenantId);

  client.listCompanies({parent: formattedParent})
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources) {
        console.log(`Company Name: ${resource.name}`);
        console.log(`Display Name: ${resource.displayName}`);
        console.log(`External ID: ${resource.externalId}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_list_companies_core]
// [END job_search_list_companies]
// tslint:disable-next-line:no-any

const argv = require(`yargs`)
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true
  })
  .option('tenant_id', {
    default: 'Your Tenant ID (using tenancy is optional)',
    string: true
  })
  .argv;

sampleListCompanies(argv.project_id, argv.tenant_id);