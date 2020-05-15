// DO NOT EDIT! This is a generated sample ("Request",  "job_search_delete_company")
'use strict';

// [START job_search_delete_company]
// [START job_search_delete_company_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Delete Company */
function sampleDeleteCompany(projectId, tenantId, companyId) {
  const client = new talent.CompanyServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const companyId = 'ID of the company to delete';
  const formattedName = client.companyPath(projectId, tenantId, companyId);
  client.deleteCompany({name: formattedName}).catch(err => {
    console.error(err);
  });
  console.log(`Deleted company`);
}


// [END job_search_delete_company_core]
// [END job_search_delete_company]
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
  .option('company_id', {
    default: 'ID of the company to delete',
    string: true
  })
  .argv;

sampleDeleteCompany(argv.project_id, argv.tenant_id, argv.company_id);