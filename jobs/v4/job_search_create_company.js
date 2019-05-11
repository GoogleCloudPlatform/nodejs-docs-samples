// DO NOT EDIT! This is a generated sample ("Request",  "job_search_create_company")
'use strict';

// [START job_search_create_company]
// [START job_search_create_company_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * Create Company
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenant
 */
function sampleCreateCompany(projectId, tenantId, displayName, externalId) {
  const client = new talent.CompanyServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const displayName = 'My Company Name';
  // const externalId = 'Identifier of this company in my system';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const company = {
    displayName: displayName,
    externalId: externalId,
  };
  const request = {
    parent: formattedParent,
    company: company,
  };
  client.createCompany(request)
    .then(responses => {
      const response = responses[0];
      console.log(`Created Company`);
      console.log(`Name: ${response.name}`);
      console.log(`Display Name: ${response.displayName}`);
      console.log(`External ID: ${response.externalId}`);
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_create_company_core]
// [END job_search_create_company]
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
  .option('display_name', {
    default: 'My Company Name',
    string: true
  })
  .option('external_id', {
    default: 'Identifier of this company in my system',
    string: true
  })
  .argv;

sampleCreateCompany(argv.project_id, argv.tenant_id, argv.display_name, argv.external_id);