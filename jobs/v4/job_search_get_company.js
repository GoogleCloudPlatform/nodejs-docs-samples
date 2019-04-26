// DO NOT EDIT! This is a generated sample ("Request",  "job_search_get_company")
'use strict';

// [START job_search_get_company]
// [START job_search_get_company_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Get Company */
function sampleGetCompany(projectId, tenantId, companyId) {
  const client = new talent.CompanyServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const companyId = 'Company ID';
  const formattedName = client.companyPath(projectId, tenantId, companyId);
  client.getCompany({name: formattedName})
    .then(responses => {
      const response = responses[0];
      console.log(`Company name: ${response.name}`);
      console.log(`Display name: ${response.displayName}`);
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_get_company_core]
// [END job_search_get_company]
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
    default: 'Company ID',
    string: true
  })
  .argv;

sampleGetCompany(argv.project_id, argv.tenant_id, argv.company_id);